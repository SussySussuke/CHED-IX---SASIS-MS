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
- Category D: nothing at all (no subtotal by design, no rows = category header not rendered at all)

Fix: replaced the direct `setStatisticsData(statistics)` branch with a call to a new `mergeStatisticsWithStructure(dbRows)` function. This function rebuilds the full ordered structure (A fixed rows → A subtotal → B user rows → B subtotal → C fixed rows → C subtotal → D user rows → TOTAL) by walking against the DB rows, filling in missing fixed rows with zero defaults, and preserving any user-added rows for B and D. It calls `recalculateStatistics()` at the end to recompute subtotals.

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
- Category D placeholder rows are UI-only (`is_placeholder: true`). They are stripped from the submit payload (`statisticsData.filter(r => !r.is_placeholder)`), skipped in validation, and cannot be deleted. When the last real D row is removed, the placeholder is re-injected.
- Placeholder rows render with a single wide `colSpan` cell saying “No entries yet” with the add icon inline. This communicates intent without fake data in the table.
