# Excel Import / Export

## Input
HEI users download a pre-filled Excel template of their current submissions, fill it offline, and re-import it. The original CHED SASTOOL_FINAL.xlsx (25 sheets) is the visual reference. The system has 24 forms (SUMMARY, MER1–4A, Annex A–O plus C-1, I-1, L-1, N-1 variants). Signatures are ignored. Import must handle empty sheets, conflicts with existing data, and malformed data.

## Process
MER1/2/3/4A and SRC are excluded from import — structurally incompatible with flat Excel. All 19 Annex forms (A, B, C, C-1, D, E, F, G, H, I, I-1, J, K, L, L-1, M, N, N-1, O) are both exportable and importable.

Sheet identity is determined by a machine-readable tag in cell A1 (e.g. `[ANNEX_A]`), not the tab name.

Two-step import: (1) parse + conflict-detect → return summary to frontend, (2) user resolves conflicts sequentially → persist in single DB transaction. Conflict resolution is summary-level only (existing status + date vs incoming row count).

Persist step calls model layer directly — controller `store()` methods return HTTP redirects and cannot be called inside a DB transaction.

### Export Sheet Layout

All sheets use the original CHED SASTOOL visual design. **All title blocks are centered, plain bold, no fill.**

**Color scheme (all sheets):**
- Import tag row: yellow `FFE699`
- Column/table headers: light green `C5E0B3`, bold black text
- Key-value field labels (D, F, G, H): light blue `DEEAF6`, bold text
- Title rows: no fill

**Tabular sheets (A, B, C, C-1, E, I, I-1, J, K, L, L-1, N, N-1, O):**
- Row 1: `[TAG]` — yellow, machine-readable
- Row 2: `ANNEX "X"` — formatted as the original (all-caps, quoted letter)
- Row 3: `LIST OF PROGRAMS/ PROJECTS/ ACTIVITIES`
- Row 4: form subtitle (all-caps)
- Row 5: `As of Academic Year (AY) YYYY-YYYY`
- Row 6: small spacer
- Row 7: column headers — light green `C5E0B3`
- Row 8+: data rows — `DATA_ROW_START = 8`

**Annex D (non-tabular, key-value form):**
- Row 1: `[ANNEX_D]` tag
- Rows 2–4: title block (`ANNEX "D"`, subtitle, AY line), centered, no fill
- Row 5: blank (matches original)
- Rows 6–7: Version/Publication date — label merged A:B (light blue), value in col C
- Rows 8–9: Officer-in-Charge — same pattern
- Rows 10–11: Handbook Committee — same pattern
- Row 12: two-column section headers — Mode of Dissemination (left) | Type of Handbook (right)
- Rows 13–18: two-column layout — col A = label, col B = value (dissemination); col B = label, col C = value (type, rows 13–16 only)
- Row 19: spacer; Row 20: "Contains the following information" section header (merged A:C)
- Rows 21–39: checkbox items — label merged A:B, value in col C
- Print area: `A1:C39`
- **Parser reads by explicit (row, col) — not sequential `$r++`.** Top 3 fields: col C rows 6/8/10. Dissemination: col B rows 13–18. Type: col C rows 13–16. Checkboxes: col C rows 21–39.

**Annex F:** Tag row 1, title block rows 3–6 (`ANNEX "F"`, list of programs, student discipline, AY), spacer row 7, activity table header row 8, data row 9+, key-value fields (committee/procedure/complaint desk) below activity table.

**Annex G:** Tag row 1, title block rows 2–4 (`ANNEX "G"`, R.A. 7079 subtitle, AY), key-value fields rows 5+, then `[EDITORIAL_BOARD]`, `[OTHER_PUBLICATIONS]`, `[PROGRAMS]` sub-tables with light green headers.

**Annex H:** Tag row 1, title block rows 2–4 (`ANNEX "H"`, list of admission services, AY), services header row 5, 5 service data rows 6–10, spacer row 11, stats header row 12, stats data rows 13+. `SERVICES_ROW_START = 6`, `STATS_ROW_START = 13`. Service types are fixed by `AnnexHAdmissionService::PREDEFINED_SERVICES` (5 entries) — export labels col A from the constant, parser ignores col A and uses the constant directly for `service_type` field.

**Annex M:** Tag row 1, title block rows 2–5 (`ANNEX "M"`, subtitle split across rows 3–4, AY row 5), spacer row 6, Table 1 label row 7, `[STATISTICS]` tag row 8, column headers row 9, data row 10+. Category header rows styled light blue `DEEAF6`. Sub-Total rows styled light green `E2EFD9`. TOTAL row styled yellow `FFFF00`. Table 2 label row precedes `[SERVICES]` tag. Services table: 5 cols (section, category, program, count, remarks) with `E2EFD9` header. Parser uses string-match for tags — row number shift is transparent.

**Page setup all sheets:** Legal landscape, fit-to-1-page-wide.

## Output
- `app/Services/ExcelExportService.php` — builds pre-filled xlsx, streams as download
- `app/Services/ExcelImportService.php` — orchestrates parsing, conflict detection, session storage
- `app/Services/ExcelPersistService.php` — saves parsed payloads directly on models
- `app/Services/Excel/Parsers/BaseParser.php` — shared cell/date/bool helpers
- `app/Services/Excel/Parsers/ParseResult.php` — immutable result DTO
- `app/Services/Excel/Parsers/TabularProgramParser.php` — reused by A, B, C, C-1
- `app/Services/Excel/Parsers/AnnexDParser.php` — explicit row/col reads (not `$r++`)
- Individual parsers: AnnexEParser through AnnexOParser (14 files)
- `app/Http/Controllers/HEI/ExcelController.php` — page(), export(), import(), confirm()
- `app/Http/Requests/HEI/ImportExcelRequest.php` — file validation (xlsx/xls, max 10MB)
- `resources/js/Pages/HEI/ExcelImport.jsx` — export download + import upload UI
- `resources/js/Components/Submissions/ImportConflictModal.jsx` — step-through conflict resolver

## Relevant Files
- `app/Http/Controllers/HEI/BaseAnnexController.php` — source of truth for overwrite/status logic that ExcelPersistService mirrors
- `app/Models/AnnexHAdmissionService.php` — `PREDEFINED_SERVICES` constant used by both AnnexHParser and ExcelExportService
- `app/Models/AnnexMStatistic.php` — `STRUCTURE` constant used by AnnexMParser for fixed matrix rows
- `TEMPLATE_SASTOOL_FINAL.xlsx` — the original CHED template; sole visual reference for layout, colors, and title text

## Key Discoveries
- Controller `store()` methods return `redirect()->route(...)` — cannot be called inside a DB transaction. Model layer must be called directly in ExcelPersistService.
- Annex M `year_data` is JSON. Export flattens to `AY YYYY-YYYY Enrollment/Graduates` headers; parser reconstructs via regex on those headers.
- Annex G has three sub-tables in one sheet; parser uses `[EDITORIAL_BOARD]`, `[OTHER_PUBLICATIONS]`, `[PROGRAMS]` marker cells as section boundaries — these must be preserved in the export.
- PhpSpreadsheet may return dates as Excel serial floats. `BaseParser::date_()` handles both.
- The old export used an invented navy/blue color scheme not present in the original CHED template. All sheets now use the original: `C5E0B3` green headers, `DEEAF6` blue field labels.
- Annex D's two-column dissemination/type layout means values are split across col B (left side) and col C (right side). The parser cannot use a simple `$r++` loop — explicit (row, col) reads are required.
- `getFont()->setBold()->setSize()` does not set alignment. Title rows appeared left-aligned until switched to `applyFromArray` with `HORIZONTAL_CENTER`.
- Annex H `PREDEFINED_SERVICES` was rewritten (8 old services → 5 new ones) without a DB migration or constant update. Existing user data had the new service names; the constant and frontend still had the old names. `$serviceMap` key lookup silently returned null for every row, exporting all service data as blank. Fix: sync `AnnexHAdmissionService::PREDEFINED_SERVICES`, `AnnexHController` validation (`size:5`), `AnnexHCreate.jsx`, and `AnnexHParser::STATS_ROW_START` (16→13 because 5 services now end at row 10, not row 13).
- Annex H and M had a row collision: the AY line and the first table header were both assigned to row 4. Fixed by pushing the table header down and adjusting all subsequent row offsets.
- Annex M statistics table: the original CHED template uses category header rows (e.g. "A. Persons with Disabilities") as visually distinct merged rows with light blue fill, separate from the subcategory data rows beneath them. The export emits a category header row whenever `$category !== $prevCategory` (and it is not a Sub-Total row), then writes subcategory data rows with an empty col A. The parser never reads the category header rows — it reads category from col 1 of each data row, which is blank for subcategory rows — but `AnnexMParser` reconstructs category from the stat model’s own `category` field, not from the export column, so this is safe.
- The title block annex name must be formatted as `ANNEX "X"` (all-caps, quoted) to match the original. The tab name format (`Annex A`) is different and must be transformed on export via regex.
- The AY line (`As of Academic Year (AY) YYYY-YYYY`) was missing entirely from all tabular sheets. It was added as row 5 in the title block.

## Decisions Made
- MER forms excluded from import — structurally incompatible with flat Excel; filled online.
- Empty sheets silently skipped; sheets with any row-level error excluded entirely (no partial imports).
- Pending import state stored in session between parse and confirm steps (`excel_import_pending`).
- Template generated on-the-fly per export request — always reflects current DB data.
- Signatures intentionally omitted from both export template and import.
- The export Excel file is a standalone printable document. It does not need to follow system UI conventions — it follows the original CHED SASTOOL layout instead.

## Annex D & G — Checkbox Redesign (Done)
Both Annex D and G export now match the original CHED SASTOOL template exactly — no hidden YES/NO cells, no separate import columns.

**Annex D changes:**
- Top 3 fields (version, OIC, committee) now inline label+value in col A (e.g. `"Version/ Publication date: 2nd Ed 2023"`)
- Rows 13–18: dissemination checkboxes live directly in col A as `"☑/☐  Label"`. Type checkboxes in col B. `type_others` flag kept hidden in C13 for backward compat.
- Rows 21–38: full-width checkbox cells (merged A:C), `"☑/☐  Label"` — no separate YES/NO col.
- `AnnexDParser` uses `checkbox_()` on col A (rows 13, 17, 18, 21-38) and col B (rows 13-14). Strips label prefixes with a `$strip` closure for text fields.

**Annex G changes:**
- Title block split to 2 rows for RA title (rows 3-4) matching original.
- Row 7: school name (col A) and fee (col B) on same row, inline label+value.
- Row 8: student publication name (col A), full width.
- Row 9: section headers (Circulation Period / Type of Publication).
- Rows 10–14: circulation checkboxes in col A. Rows 10–13: type checkboxes in col B. No hidden YES/NO.
- Row 14 col A: `"☑/☐  Others, please specify <text>"` — specify text embedded in label.
- Rows 15–18: spacer + Table 1 header + adviser name/position (col B).
- `AnnexGParser` rewritten with explicit row/col reads. Uses `checkbox_()` for all checkbox cells. `stripPrefix` closure handles inline label+value cells. Specify-text extracted from label cells via `stripos('specify')`.

**BaseParser addition:**
- `checkbox_(Worksheet, row, col): bool` — reads `☑/✓/ü/✔` = true, `☐/◻` = false, falls back to YES/NO strings.

## To Be Fixed Soon
- `ExcelPersistService::resolveStatus()` duplicates overwrite/status logic from `BaseAnnexController`. Should be extracted to a shared Action class.
