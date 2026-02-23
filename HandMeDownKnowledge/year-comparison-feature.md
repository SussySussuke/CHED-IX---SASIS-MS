# SummaryView — Year Comparison & Drilldown Feature

## Stack
- AG Grid **v35.0.1** (ag-grid-community + ag-grid-react)
- React / Vite / Laravel Inertia
- `YearMultiSelect` replaced `AcademicYearSelect` — onChange returns `string[]`

---

## Key Files

| File | Role | Editable? |
|------|------|-----------|
| `resources/js/Pages/Admin/SummaryView.jsx` | Main page — orchestrates everything | YES |
| `resources/js/Components/Forms/YearMultiSelect.jsx` | Multi-select year picker, onChange returns `string[]` | YES |
| `resources/js/Components/Modals/RecordsModal.jsx` | Drilldown modal with category-change checkboxes | YES |
| `resources/js/Config/summaryView/summaryConfig.js` | Registry of sections, drilldown URLs, recategorize URLs | YES |
| `resources/js/Config/summaryView/comparisonConfig.js` | Fields/groups per section for multi-year comparison. Has `clickable` + `categoryKey` on activity fields | YES |
| `resources/js/Config/summaryView/comparisonUtils.jsx` | Builds AG Grid columnDefs + rowData for comparison mode | YES |
| `resources/js/bootstrap.js` | Axios CSRF setup — sets X-CSRF-TOKEN globally | YES |
| `resources/js/Components/Common/AGGridViewer.jsx` | Wraps AgGridReact — **DO NOT MODIFY** | NO |
| `resources/js/Config/summaryView/healthConfig.jsx` (and other `*Config.jsx`) | Single-year column configs — **DO NOT MODIFY** | NO |
| `app/Http/Controllers/Admin/SummaryViewController.php` | All backend data + evidence endpoints | YES |

---

## How The Flow Works

### Year Selection
`YearMultiSelect` → `handleYearsChange(years: string[])` → `setSelectedYears(years)` → `useEffect` → `fetchAllSelectedYears(activeSection, selectedYears)`

- `isComparing = selectedYears.length > 1`
- `primaryYear = selectedYears[selectedYears.length - 1]` (last selected)
- Single year: `sectionData` = raw rows; `columnDefs` = `section.getColumns(openDrilldown)`
- Multi year: `sectionData` = `buildComparisonRows(dataByYear, years)`; `columnDefs` = `buildComparisonColumns(sectionId, years, onDrilldown)`

### Drilldown / Category Change (RecordsModal)
Works in **both single-year AND multi-year** mode.

Sections with full recategorize support (checkboxes to change category):
- `2-Info-Orientation`, `1B-Personnel`, `3-GuidanceCounselling`, `4-CareerJob`, `5-Health`

Sections with drilldown only (no recategorize):
- `8-SocialCommunity`, `9-StudentOrganization`, `10-Culture`, `11-Scholarship`, `13-Dorm`

In **comparison mode**, only the above drilldown-capable sections show clickable cells. Delta (Δ) columns are always read-only.

### openDrilldown signature
```js
openDrilldown(category, heiId, heiName, count, year = null)
// year is passed explicitly in comparison mode (which column was clicked)
// year falls back to primaryYearRef.current in single-year mode
```

`drilldown` state stores `{ isOpen, heiId, heiName, category, year, zeroTargetCategory }`.
`modalProps` uses `drilldown.year` (NOT `primaryYear`) to build fetch URLs — so the modal always fetches the exact year that was clicked.

---

## comparisonConfig.js — clickable fields

Fields with `clickable: true` + `categoryKey` in comparisonConfig fire the drilldown on click.
Only `_activities` fields and `total_activities` / `total_personnel` are marked clickable.
Student count fields, boolean fields, and text fields are never clickable.

Sections with clickable fields: `1B-Personnel` (total_personnel only), `2-Info-Orientation`, `3-GuidanceCounselling`, `4-CareerJob`, `5-Health`.

---

## comparisonUtils.jsx — key design decisions

- `buildComparisonColumns(sectionId, years, onDrilldown = null)` — 3rd param optional
- `onDrilldown` is only passed to year column leaf cells, NEVER to delta column leaf cells
- Clickable cells render a blue/yellow button with `→` suffix; yellow for `uncategorized`/`others` categoryKey
- Year-scoped `groupId` on ALL sub-groups prevents AG Grid v35 from merging identically-named sub-headers across year columns
- `marryChildren: true` on top-level year/delta groups only

---

## SummaryView.jsx — key design decisions

- `openDrilldown` and `openSimpleDrilldown` are **permanently stable** callbacks (no deps) — they read `primaryYear` via `primaryYearRef` to avoid rebuilding columnDefs on every year change
- `columnDefs` useMemo deps: `[activeSection, isComparing, selectedYears]` — `selectedYears` needed because `buildComparisonColumns` needs the full year list
- Modal render: `{modalProps && (<RecordsModal .../>)}` — no `isComparing` guard, works in both modes
- `handleRecategorized` refetches ALL selected years after a category save, keeping comparison data fresh

---

## All Completed Fixes

| Issue | Status | Fix Location |
|-------|--------|--------------|
| `hei_type` missing → Type column = undefined in comparison | ✅ FIXED | `SummaryViewController.php` — added to all 13 endpoints |
| Sub-group headers missing in multi-year grouped sections | ✅ FIXED + CONFIRMED | `comparisonUtils.jsx` — year-scoped `groupId` on sub-groups |
| HEI Code + Type columns showing in comparison mode | ✅ FIXED | `comparisonUtils.jsx` — removed from `identityCols` |
| 419 CSRF error on category save PATCH | ✅ FIXED | `bootstrap.js` + `RecordsModal.jsx` — axios with global CSRF header |
| Drilldown/category change disabled in comparison mode | ✅ FIXED | `comparisonConfig.js` + `comparisonUtils.jsx` + `SummaryView.jsx` |

---

## Status: ALL KNOWN ISSUES RESOLVED — needs browser testing
