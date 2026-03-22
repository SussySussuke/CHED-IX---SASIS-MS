# Excel Import / Export

## Input
HEI users need to download a pre-filled Excel template of their current submissions, fill it offline, and re-import it. The original CHED SASTOOL_FINAL.xlsx had 25 sheets (SRC, M&ER1–4, Table of Annexes, Annex A–O). Existing system has 24 forms (SUMMARY, MER1–4A, Annex A–O plus C-1, I-1, L-1, N-1 variants). Signatures in the original template are to be ignored. Importing must handle: empty sheets, conflicts with existing data, and bad/malformed data.

## Process
Established that not all 25 original sheets are importable — MER1/2/3/4A and SRC were excluded (complex structured forms, online-only). All 19 Annex forms (A, B, C, C-1, D, E, F, G, H, I, I-1, J, K, L, L-1, M, N, N-1, O) are both exportable and importable.

Sheet identity is determined by a machine-readable tag in cell A1 (e.g. `[ANNEX_A]`), not the tab name, since users can rename tabs.

Two-step import: (1) parse + conflict-detect → return summary to frontend, (2) user resolves conflicts one at a time, then confirms → persist in single DB transaction.

Conflict resolution reuses the existing `CompareModal` pattern but as a new `ImportConflictModal` since the existing one is single-annex and comparison-only; here multiple conflicts step through sequentially with approve/skip per sheet. Summary-level comparison only (existing status + date vs incoming row count) — no field-by-field diff.

Persist step could not call existing controller `store()` methods directly — they return HTTP redirects, breaking the DB transaction. Instead, `ExcelPersistService` replicates the model-level overwrite/status logic from `BaseAnnexController` directly, per README rule (business logic in Services, not controllers).

### Export Sheet Layout

The exported template mirrors the original CHED SASTOOL visual design for printability while remaining machine-parseable for import.

**Tabular sheets (A, B, C, C-1, E, I, I-1, J, K, L, L-1, N, N-1, O):**
- Row 1: `[TAG]` — yellow background, machine-readable import tag
- Rows 2–5: title block — annex name, "LIST OF PROGRAMS/PROJECTS/ACTIVITIES", form sub-title, AY placeholder (plain bold, no background fill)
- Row 6: small spacer
- Row 7: column headers — light green background (`C5E0B3`), matching original CHED template
- Row 8+: data rows
- All parsers use `DATA_ROW_START = 8`

**Annex D (non-tabular):**
- Row 1: `[ANNEX_D]` tag
- Rows 2–4: title block (plain bold)
- Rows 5–36: key-value field rows — col A = label (light blue `DEEAF6` background), col B = value
- Parser reads col B by position (`$r++`) starting at row 5 — row order is the import contract, do not change it
- Row 18 is a section header label; its col B value is intentionally blank (the parser still reads and stores it as empty)
- Col C is present for visual width (matching original) but unused by parser

**Page setup applied to all sheets:** Legal landscape, fit-to-1-page-wide.

**Annex F, G, H, M** retain their existing navy/blue color scheme — they were not refactored in this pass.

## Output
- `app/Services/ExcelImportService.php` — orchestrates parsing, conflict detection, session storage of pending state
- `app/Services/ExcelExportService.php` — builds pre-filled xlsx from DB, streams as download
- `app/Services/ExcelPersistService.php` — saves parsed payloads, handles overwrite/status logic directly on models
- `app/Services/Excel/Parsers/BaseParser.php` — shared cell/date/bool/blank helpers
- `app/Services/Excel/Parsers/ParseResult.php` — immutable result DTO (sheetId, label, payload, errors, isEmpty)
- `app/Services/Excel/Parsers/TabularProgramParser.php` — reused by A, B, C, C-1 (same column layout, `hasTargetGroup` flag)
- Individual parsers: AnnexDParser through AnnexOParser (15 files)
- `app/Http/Controllers/HEI/ExcelController.php` — page(), export(), import(), confirm()
- `app/Http/Requests/HEI/ImportExcelRequest.php` — file validation (xlsx/xls, max 10MB)
- `resources/js/Pages/HEI/ExcelImport.jsx` — export download + import upload with parse result review UI
- `resources/js/Components/Submissions/ImportConflictModal.jsx` — step-through conflict resolver
- `resources/js/Layouts/HEILayout.jsx` — added Import/Export nav link
- `routes/web.php` — 4 new HEI routes, ExcelController imported
- `composer.json` — `phpoffice/phpspreadsheet ^3.0` added

## Relevant Files
- All files listed above
- `app/Http/Controllers/HEI/BaseAnnexController.php` — source of truth for overwrite/status logic that ExcelPersistService mirrors
- `app/Models/AnnexHAdmissionService.php` — `PREDEFINED_SERVICES` constant used by both AnnexHParser and ExcelExportService
- `app/Models/AnnexMStatistic.php` — `STRUCTURE` constant used by AnnexMParser for fixed matrix rows

## Key Discoveries
- All controller `store()` methods return `redirect()->route(...)`, not JSON — they cannot be called inside a DB transaction without triggering a redirect mid-loop. Must call model layer directly.
- Annex M stores `year_data` as JSON (array cast). Export flattens it to `AY YYYY-YYYY Enrollment` / `AY YYYY-YYYY Graduates` column headers. Parser reads these headers dynamically by regex to reconstruct the array.
- Annex G has three sub-tables (editorial board, other publications, programs) in a single sheet. Parser uses marker cells `[EDITORIAL_BOARD]`, `[OTHER_PUBLICATIONS]`, `[PROGRAMS]` to detect section boundaries. These markers must be preserved in the template.
- PhpSpreadsheet may return dates as Excel serial floats, not strings. `BaseParser::date_()` handles both numeric serial and common string formats.
- `TabularProgramParser` uses a `hasTargetGroup` constructor flag to handle the column shift between Annex C (no target_group) and A/B/C-1 (has target_group).
- **Export layout and parser `DATA_ROW_START` are a coupled contract.** The tabular header block occupies rows 1–7, so data starts at row 8. Every tabular parser has `DATA_ROW_START = 8`. If the header row count ever changes in the export, all affected parsers must be updated together.
- **Annex D parser reads by row position, not label text.** `AnnexDParser` increments `$r` once per field from row 5. The order of entries in the `$fields`/`$values` arrays in `addAnnexDSheet()` is the import contract — reordering breaks import silently with no errors thrown.
- The original CHED SASTOOL template uses no background fill on title rows and `C5E0B3` (light green) on tabular column headers. The initial export used an invented navy/blue scheme that did not match the original.

## Decisions Made
- MER forms excluded from import: they are structurally incompatible with a flat Excel layout and are filled online. Consistent with CHED/DepEd practice where tabular annexes use Excel and complex forms use web portals.
- Empty sheets silently skipped, not errored — standard ETL behavior.
- Sheets with any row-level error are entirely excluded from import, not partially imported. User must fix and re-upload. Prevents partial/corrupt data entering the system.
- Pending import state stored in session between parse and confirm steps — avoids requiring file re-upload. Session key: `excel_import_pending`.
- Template generated on-the-fly per export request, not stored as a static file — ensures it always reflects current DB data.
- Signatures from original CHED template intentionally omitted in both template and import.
- Export visual style corrected to match the original CHED SASTOOL template (plain bold title rows, light green headers, light blue Annex D field labels) so printed output is consistent with what CHED offices expect.
- Annex F, G, H, M sheets intentionally left on their existing navy/blue scheme for now — they were not part of the visual correction pass and are still functional.

## To Be Fixed Soon
- `ExcelPersistService::resolveStatus()` duplicates the overwrite/status logic from `BaseAnnexController`. If that logic ever changes in the controller, this service must be updated too. Should be extracted to a shared Action class to eliminate duplication.
- Annex F, G, H, M export sheets still use the invented navy/blue color scheme instead of matching the original CHED template. Should be corrected in the same pass as any future work on those sheets.
