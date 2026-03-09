# Delta Column Toggle — SummaryView Comparison Mode

## Feature Summary
Added a toggle to show/hide Δ (delta/trend) columns in multi-year comparison mode.
Applies to both the AG Grid display and Excel export.

---

## Input
- `showDelta` boolean state in `SummaryView.jsx` (default `true`)
- User clicks the toggle button (visible only when `isComparing === true`)

## Process
1. `toggleShowDelta` flips `showDelta` via functional update (`prev => !prev`), stable via `useCallback([], [])`
2. `columnDefs` useMemo (deps: `[activeSection, isComparing, selectedYears, showDelta]`) calls `buildComparisonColumns(..., { showDelta })`
3. `buildComparisonColumns` receives `{ showDelta = true }` as 4th options param — gates the delta group emit behind `showDelta &&`
4. `handleExport` passes `showDelta` into `exportSummaryToExcel`, which threads it to `buildLeafDescriptors` — delta leaf/group emission gated the same way
5. Comparison banner Δ description line conditionally rendered based on `showDelta`

## Output
- When `showDelta = false`: grid and export contain only year columns, no Δ columns
- When `showDelta = true`: existing behavior unchanged
- Toggle button: orange when on, gray/muted when off; only visible in comparison mode

---

## Relevant Files

| File | Change |
|------|--------|
| `resources/js/Pages/Admin/SummaryView.jsx` | State, toggle callback, button UI, wired to columnDefs + export |
| `resources/js/Config/summaryView/comparisonUtils.jsx` | `buildComparisonColumns` 4th param `{ showDelta = true }`, delta block gated |
| `resources/js/Utils/excelExport.js` | `exportSummaryToExcel` + `buildLeafDescriptors` accept `showDelta`, delta emit gated |

---

## Key Decisions

- **Options object as 4th param** (`{ showDelta = true } = {}`) — backward-compatible; zero existing callers break if they pass nothing
- **`showDelta` in `columnDefs` useMemo deps** — required because toggling changes which columns `buildComparisonColumns` returns
- **AG Grid key prop NOT updated** — deliberately excludes `showDelta`; grid should update columns in-place, not remount. Remounting on toggle would be jarring and unnecessary
- **Single state source** — `showDelta` is read by both the grid and the export handler; no duplicate/diverging flags
- **Toggle only appears when `isComparing`** — irrelevant in single-year mode, no dead UI

## Dead Ends / Avoided Paths
- Adding a separate `showDeltaExport` flag was considered and rejected — same state should drive both display and export, no reason to diverge

## To Be Fixed Soon
_(none)_
