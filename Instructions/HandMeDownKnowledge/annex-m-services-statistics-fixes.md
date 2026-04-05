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

---

## Session 3 — Renderer Zeros & Prior-Year Columns

## Input
Annex M submission list renderer showed 0 for all enrollment and graduate values. Request to also show the prior 2 academic years (like the editor does).

## Process
**Root cause of zeros:** `getBatchData()` returned `$batch->statistics` directly. Laravel's `'array'` cast on `year_data` decodes the JSON string when accessed via the model accessor, but when the collection is serialized via `response()->json()` it calls `toArray()` — which in some MySQL/Laravel version combinations returns `year_data` still as a raw JSON string. The renderer's `typeof yearData === 'string'` guard existed but was never hit in testing; in production MySQL it was consistently a string. The fix is to explicitly decode with `is_string()` check in the controller before returning, casting values to `int`.

**Prior-year columns:** The editor gets all years via `getExistingBatches()` (all batches passed as props). `getBatchData()` only fetched the single requested batch, so the renderer had no prior-year data at all. Fix: controller now derives the two prior AYs from the current batch's `academic_year`, loads those sibling batches, indexes their stats by `category||subcategory`, and merges the values into each current-batch row's `year_data`. The renderer receives a single row with all 3 AY keys populated.

**Renderer changes:** Removed the now-redundant Total columns (summing across 3 years is misleading since they are distinct annual counts, not cumulative). Added `academic_year` prop from the controller response to distinguish current AY from prior years visually (green highlight for current, grayed italic for prior — matching editor styling). `years` array is now built by scanning only the first non-empty row's keys (all rows have identical keys after the controller merge) instead of scanning all rows.

## Output
- `app/Http/Controllers/HEI/AnnexMController.php`: `getBatchData()` rewritten — explicit `is_string` decode, prior-batch merge, returns `academic_year` and `prior_years` alongside `statistics` and `services`
- `resources/js/Components/Submissions/AnnexRenderers.jsx`: `renderAnnexM` updated — reads `data.academic_year`, removed Total columns, added current/prior year visual distinction, moved `getYearData` before `years` derivation

## Relevant Files
- `app/Http/Controllers/HEI/AnnexMController.php` — `getBatchData()` is the only endpoint that feeds the renderer
- `resources/js/Components/Submissions/AnnexRenderers.jsx` — `renderAnnexM`
- `resources/js/Hooks/useSubmissionData.js` — fetches via `fetchDataUrl`, calls `response.json()`, passes result directly to renderer as `data`
- `resources/js/Components/Submissions/renderers/index.jsx` — routes `annex === 'M'` to `renderAnnexM`

## Key Discoveries
- `response()->json($batch->statistics)` with an Eloquent cast of `'array'` does NOT guarantee a decoded object on the JS side in all environments. Always explicitly decode with `is_string()` check in the controller before returning JSON responses that contain cast fields.
- The renderer previously called `getYearData()` inside the `years.map()` loop per-cell (redundant). Moved to once per row.
- `categoryInfo.count` (no null guard) would crash if a TOTAL row appeared before its category was registered. Added `?? 1` null-safe fallback.
- Total columns were removed: summing enrollment + graduates across 3 separate academic years produces a meaningless number (it is not a 3-year total enrollment, it is triple-counting students).

## Decisions Made
- Prior-year data is fetched server-side in `getBatchData()`, not client-side. Keeps the renderer stateless and dumb.
- Rows with no matching prior-year sibling default to `{enrollment: 0, graduates: 0}` — same behavior as the editor's `getPriorValue()` fallback.
- `academic_year` and `prior_years` are added to the `getBatchData` JSON response. No route or schema changes needed.

---

## Session 4 — Renderer Missing Year Columns (Wrong Controller Called)

## Input
Renderer showed only Category and Subcategory columns — no year columns at all. Prior-year fix from Session 3 had no visible effect.

## Process
Session 3 fixed `AnnexMController::getBatchData()` correctly. However, the submission history page routes through a **different controller**: `HEI\SubmissionController::getBatchData()` via `GET /hei/submissions/{annex}/{batchId}/data`. That method had its own hardcoded Annex M branch returning a flat, stale response shape:
- Flattened `year_data` into hardcoded keys: `ay_2023_2024_enrollment`, `ay_2022_2023_enrollment`, etc.
- No `year_data` key → `getYearData(row)` in the renderer returned `{}` → `years = []` → zero year columns rendered.
- Hardcoded 2021–2024 AYs regardless of the batch's actual academic year.
- No `academic_year` or `prior_years` returned.

The `AnnexMController`-specific route (`GET /hei/annex-m/{batch_id}/data`) is only used by the edit flow, not the history renderer.

## Output
`SubmissionController::getBatchData()` Annex M branch replaced with a single delegation call to `app(AnnexMController::class)->getBatchData($batchId)`. All prior-year merging, `is_string` decode, and correct response shape are handled by `AnnexMController`.

## Relevant Files
- `app/Http/Controllers/HEI/SubmissionController.php` — `getBatchData()`, Annex M branch
- `app/Http/Controllers/HEI/AnnexMController.php` — canonical `getBatchData()`, now the single source of truth
- `resources/js/Components/Submissions/AnnexRenderers.jsx` — `renderAnnexM`, unchanged

## Key Discoveries
- Two separate routes serve the same renderer: `SubmissionController` (history page) and `AnnexMController` (edit page). Only the latter was updated in Session 3.
- `SubmissionController::getBatchData()` has bespoke branches for H, M, G, D, and MER types. Each is an independent implementation — changes to a feature controller do NOT propagate here automatically.
- `getHeiId()` and `checkOwnership()` in `BaseAnnexController` call `Auth::user()` directly, so delegating via `app()` is safe — no controller-instance state involved.

## Decisions Made
- Delegate from `SubmissionController` to `AnnexMController` rather than duplicating or extracting to a Service. Single source of truth, minimal change surface.
- Per README: "Before fixing a problem locally, ask: could this same problem occur across other features?" — Other annexes with bespoke `SubmissionController` branches (H, G, D) should be audited for the same drift risk if their feature controllers are ever updated.

---

## Session 5 — `category` Field Removal from `annex_m_services`

## Input
`annex_m_services.category` was never populated in the UI (column removed in Session 1), always `null` in the DB, yet still existed as a fillable model field, a validated controller field, an exported Excel column (col B "Sub-category"), and a parsed import field. The export column headers were also wrong: col A was labeled "Category" but wrote `section`; col B was labeled "Sub-category" but wrote `category`.

## Process
Confirmed `category` is always `null` in practice: the JSX `handleAddService` initializer had already dropped it, so no new submission ever populated it. Safe to hard-delete.

Dropped the field across the full stack: DB migration, model `$fillable`, controller validation, export sheet (4-col layout replacing 5-col), parser col indices shifted (program: 3→2, count: 4→3, remarks: 5→4, blank-row check: cols 1–5 → 1–4).

Fixed export column headers: col A now reads "Category of Students with Special Needs" (accurately describing `section`). The "Sub-category" column is gone entirely.

## Output
- `database/migrations/2026_03_31_000001_drop_category_from_annex_m_services.php` — drops column, reversible
- `app/Models/AnnexMService.php` — removed `category` from `$fillable`
- `app/Http/Controllers/HEI/AnnexMController.php` — removed `services.*.category` validation rule
- `app/Services/ExcelExportService.php` — `addAnnexMSheet()` services table: 5→4 cols, corrected headers
- `app/Services/Excel/Parsers/AnnexMParser.php` — services section: removed `category` read, shifted col indices, updated `isRowBlank` span
- `resources/js/Components/Submissions/AnnexRenderers.jsx` — `renderServicesTable`: removed "Category" column header and `service.category` cell

## Key Discoveries
- The export had inverted column header names: "Category" (col A) held `section` data, "Sub-category" (col B) held `category` data. Misleading even before the field was dead weight.
- `ExcelPersistService::persistAnnexM()` passes `$svc` arrays directly to `->create()` — no change needed there since `category` is no longer in `$fillable` and would be silently ignored even on old exports during the transition.
- `AnnexMCreate.jsx` had already removed `category` from the service row initializer in Session 1, so no JSX change was needed.

## Decisions Made
- Hard delete (migration) rather than leaving the column nullable and ignored. Dead columns create confusion for future devs.
- `php artisan migrate` required to apply; no `migrate:fresh` needed since data loss is intentional (column was always null).

## Known Drift Risk
`DemoDataSeeder::seedAnnexM()` still referenced `category` in its services insert after the column was dropped. On `migrate:fresh --seed` this throws `SQLSTATE[42S22]: Column not found`. Fixed in the same session by removing `category` from the insert array and the foreach tuple. Rule: any time a column is dropped by migration, grep the seeder for that column name before committing.
