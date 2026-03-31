# Annex M — Services Category Column Removal & Statistics Structure Merge

## Input
Two bugs reported on Annex M (Students with Special Needs/PWD):
1. Services table in the UI had a redundant "Category" dropdown (listing A/B/C/D sections) on every row — this column exists in the DB and Excel export/import for flat-layout reasons, but is meaningless in the grouped UI where each sub-table is already scoped to one section.
2. Statistics table only showed Category A with data after a form had been saved at least once. Categories B, C, and D were blank or absent on reload even though they have predefined or user-addable rows.

## Process

**Bug 1 — Category column in Services UI:**
`renderServicesTable(section)` in `AnnexMCreate.jsx` rendered a `<select>` dropdown populated with `SECTIONS` for a `category` field. Since the function already receives `section` as its argument (and each call renders one grouped sub-table), the dropdown was entirely redundant in the UI. The `category` field is kept in the DB, model, controller validation (`nullable`), and Excel export/import — only the UI column was removed.

**Bug 2 — Statistics categories B/C/D missing after first save:**
Root cause: the `useEffect` that seeds statistics state had a simple branch — if `statistics.length > 0` (from DB), set state directly; else call `initializeStatistics()`. After the first save, the DB always returns at least the subtotal rows for A, B, C, so `statistics.length > 0` is true and `initializeStatistics()` never fires. The raw DB rows were used as-is, which meant:
- Category B: only its Sub-Total row (no user rows = nothing visible above it in the table, add button is there but no rows render)
- Category C: its 2 fixed subcategory rows were absent if the user never explicitly submitted data for them
- Category D: nothing at all (no rows, no subtotal = category header never rendered)

Fix: replaced the direct `setStatisticsData(statistics)` branch with a call to a new `mergeStatisticsWithStructure(dbRows)` function. This function rebuilds the full ordered structure (A fixed rows → A subtotal → B user rows → B subtotal → C fixed rows → C subtotal → D user rows → D subtotal → TOTAL) by walking against the DB rows, filling in missing fixed rows with zero defaults, and preserving any user-added rows for B and D. It calls `recalculateStatistics()` at the end to recompute subtotals.

Category D was given a Sub-Total row (matching B). `AnnexMStatistic::STRUCTURE` still declares D as `has_subtotal: false` but the UI and DB both treat it with a subtotal — the model constant is only used by the Excel export/import layer which handles D differently.

Prior-year user rows for B and D (e.g. a custom "Lumad" entry saved in 2023-2024): `mergeStatisticsWithStructure` pulls all user rows from the DB payload for those categories and pushes them into the merged array with their original `year_data` intact. The prior-year read-only columns call `getPriorValue()` which looks up the row by category+subcategory in that year's batch, so the 50-enrollment "Lumad" row will appear in the grayed prior-year columns. The current-year editable cells default to 0 since no current-year data exists for that row yet.

`mergeStatisticsWithStructure` is defined before `recalculateStatistics` in the file but is only *invoked* at runtime inside `useEffect`, so `recalculateStatistics` is already in scope by then — no hoisting issue.

## Output
- `AnnexMCreate.jsx`: `mergeStatisticsWithStructure` function added; services `<select category>` column removed from thead and tbody

## Relevant Files
- `resources/js/Pages/HEI/Forms/AnnexMCreate.jsx` — all UI changes
- `app/Models/AnnexMService.php` — `category` kept as fillable/nullable; `SECTIONS` const untouched
- `app/Models/AnnexMStatistic.php` — `STRUCTURE` const is source of truth for category/subcategory layout
- `app/Http/Controllers/HEI/AnnexMController.php` — `services.*.category` validation is `nullable`; no change
- `app/Services/ExcelExportService.php` — `addAnnexMSheet()` still writes `section` (col A) + `category` (col B) for the flat Services sub-table; unchanged
- `app/Services/Excel/Parsers/AnnexMParser.php` — still reads `category` from col 2 of Services; unchanged

## Key Discoveries
- `category` on `annex_m_services` exists to support the flat Excel layout where all service rows across all sections are in one table — `section` is the group identifier and `category` is an optional sub-label. In the UI the grouping is structural, making the field invisible but still persisted to DB.
- Category D has no subtotal row by design (`has_subtotal: false` in `AnnexMStatistic::STRUCTURE`). `mergeStatisticsWithStructure` respects this — D user rows are appended directly before TOTAL with no subtotal injected.
- The statistics `useEffect` depends on `[selectedYear]`. The merge function captures `selectedYear` via closure for building zero-default `year_data` — correct because only the current year is editable.

## Decisions Made
- `category` column stays in DB, model, controller, and Excel. No migration needed. Only the UI column was removed.
- `mergeStatisticsWithStructure` is an additive path only for the DB-loaded case. Fresh forms (no DB rows) still go through `initializeStatistics()` unchanged.
- Fixed subcategory rows for A and C that are absent from older DB submissions are silently injected with zero values on load and saved with real values on next submit.
- Category D was given a Sub-Total row in the UI, making it behave identically to Category B. `AnnexMStatistic::STRUCTURE` still says `has_subtotal: false` for D — that constant only drives the Excel export/import layer and was not changed. The DB will now store a D Sub-Total row on next submit.
- `recalculateStatistics` includes D in its subtotal loop; TOTAL now sums all four subtotals uniformly.

---

## Session 2 — Seeder Data Shape Mismatch

## Input
Annex M statistics and services appeared blank/empty on all demo HEIs despite the seeder running without error. Actions column in the services table was never visible.

## Process
Seeder method `seedAnnexM()` existed and was called correctly from `seedYear()` and `seedYearPartialHeavy()`. Data was being inserted into both `annex_m_statistics` and `annex_m_services` — but with completely wrong field values inherited from an earlier version of the form (health services tracking, not PWD/special needs).

Three mismatches found:
1. **`annex_m_statistics.category`** held subcategory-level names (`'Medical Consultation'`, `'Dental Consultation'`, etc.) instead of the four category strings the UI filters on (`'A. Persons with Disabilities'`, `'B. Indigenous People'`, `'C. Dependents of Solo Parents / Solo Parents'`, `'D. Other students with special needs'`, `'TOTAL'`). `mergeStatisticsWithStructure()` `.find()` matched nothing — all rows silently orphaned, UI fell back to all-zero defaults.
2. **`annex_m_statistics.year_data`** was stored as `{"sem1": N, "sem2": N}` instead of `{"<AY>": {"enrollment": N, "graduates": N}}`. Even if category had matched, the UI's `year_data?.[selectedYear]?.enrollment` would have returned `undefined`.
3. **`annex_m_services.section`** used `'Health Services'`, `'Psychological Services'`, `'Preventive Programs'` instead of the four `SECTIONS` strings. `services.filter(s => s.section === section)` returned empty for all four sections — no table rendered, Actions column never appeared.

## Output
- `database/seeders/DemoDataSeeder.php`: `seedAnnexM()` fully rewritten with correct category/subcategory strings, correct `year_data` JSON shape, and correct section strings. Seeded data: all 7 Category A fixed subcategories + Sub-Total, 2 Category B user rows (Lumad, Mangyan) + Sub-Total, 2 Category C fixed subcategories + Sub-Total, 1 Category D user row (Student Athletes) + Sub-Total, TOTAL. Services: 2 rows per section A/B/D, 1 row for section C.

## Relevant Files
- `database/seeders/DemoDataSeeder.php` — `seedAnnexM()` rewritten
- `app/Models/AnnexMStatistic.php` — `STRUCTURE` const: authoritative category/subcategory list
- `app/Models/AnnexMService.php` — `SECTIONS` const: authoritative section strings
- `resources/js/Pages/HEI/Forms/AnnexMCreate.jsx` — `SECTIONS`, `CATEGORY_A_SUBCATEGORIES`, `CATEGORY_C_SUBCATEGORIES` constants must stay in sync with seeder

## Key Discoveries
- The seeder was written for a completely different version of Annex M (health services tracking). The schema changed to PWD/special needs tracking but the seeder was never updated.
- `seeder-and-demo-data.md` listed Annex M as `✅` seeded — technically true (method ran), but the data was structurally invisible to the UI. Updated coverage note accordingly.
- Actions column in services table is conditional: only visible when `sectionServices.length > 0`. With all service rows orphaned by wrong section keys, the table itself didn't render, making it look like the column was missing.
- Statistics Actions column is also conditional: only `canRemoveSubcategory()` rows (non-subtotal B/D rows) show the trash button. On a fresh/empty form this column is always blank — expected behavior, not a bug.

## Decisions Made
- Seeder rewritten in-place; no new method created. Data shape matches `AnnexMStatistic::STRUCTURE` and `AnnexMService::SECTIONS` exactly.
- `year_data` stores only the current batch's AY key per row (matching how the controller saves it and how `mergeStatisticsWithStructure` reads it).
- Sub-Total rows are seeded for all four categories including D, consistent with the UI's behavior after the Session 1 fix (D Sub-Total is rendered in UI even though `STRUCTURE` says `has_subtotal: false`).
- Must run `php artisan migrate:fresh --seed` to replace stale seeded data with corrected rows.
