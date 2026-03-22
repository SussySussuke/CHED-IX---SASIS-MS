# Excel Import / Export

## Input
HEI users need to download a pre-filled Excel template of their current submissions, fill it offline, and re-import it. The original CHED SASTOOL_FINAL.xlsx had 25 sheets (SRC, M&ER1–4, Table of Annexes, Annex A–O). Existing system has 24 forms (SUMMARY, MER1–4A, Annex A–O plus C-1, I-1, L-1, N-1 variants). Signatures in the original template are to be ignored. Importing must handle: empty sheets, conflicts with existing data, and bad/malformed data.

## Process
Established that not all 25 original sheets are importable — MER1/2/3/4A and SRC were excluded (complex structured forms, online-only). All 19 Annex forms (A, B, C, C-1, D, E, F, G, H, I, I-1, J, K, L, L-1, M, N, N-1, O) are both exportable and importable.

Sheet identity is determined by a machine-readable tag in cell A1 (e.g. `[ANNEX_A]`), not the tab name, since users can rename tabs.

Two-step import: (1) parse + conflict-detect → return summary to frontend, (2) user resolves conflicts one at a time, then confirms → persist in single DB transaction.

Conflict resolution reuses the existing `CompareModal` pattern but as a new `ImportConflictModal` since the existing one is single-annex and comparison-only; here multiple conflicts step through sequentially with approve/skip per sheet. Summary-level comparison only (existing status + date vs incoming row count) — no field-by-field diff.

Persist step could not call existing controller `store()` methods directly — they return HTTP redirects, breaking the DB transaction. Instead, `ExcelPersistService` replicates the model-level overwrite/status logic from `BaseAnnexController` directly, per README rule (business logic in Services, not controllers).

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

## Decisions Made
- MER forms excluded from import: they are structurally incompatible with a flat Excel layout and are filled online. Consistent with CHED/DepEd practice where tabular annexes use Excel and complex forms use web portals.
- Empty sheets silently skipped, not errored — standard ETL behavior.
- Sheets with any row-level error are entirely excluded from import, not partially imported. User must fix and re-upload. Prevents partial/corrupt data entering the system.
- Pending import state stored in session between parse and confirm steps — avoids requiring file re-upload. Session key: `excel_import_pending`.
- Template generated on-the-fly per export request, not stored as a static file — ensures it always reflects current DB data.
- Signatures from original CHED template intentionally omitted in both template and import.

## To Be Fixed Soon
- `ExcelPersistService::resolveStatus()` duplicates the overwrite/status logic from `BaseAnnexController`. If that logic ever changes in the controller, this service must be updated too. Should be extracted to a shared Action class to eliminate duplication.
- `composer install` must be run manually after pulling — PHPSpreadsheet is declared in `composer.json` but not yet installed.
