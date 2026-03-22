# Grand Total Pinned Row — SummaryView

## Feature Summary
Adds a "Grand Total" row pinned at the bottom of every AG Grid table in SummaryView that has meaningful numeric columns. The row always reflects the full dataset — never just the visible page.

---

## Input
- `sectionData` — full row array fetched from the API (all HEIs, not paginated)
- `activeSection` — determines which fields to sum and whether totals apply
- `isComparing` — comparison mode uses `year::field` prefixed keys instead of raw fields
- `selectedYears` — needed in comparison mode to iterate prefixed keys

## Process
1. `SummaryView.jsx` calls `computeTotalsRow(activeSection, sectionData, isComparing, selectedYears)` inside a `useMemo`
2. `computeTotalsRow` returns `null` for sections with no meaningful numeric totals (Profile, Admission, Discipline, SafetySecurity); otherwise returns a row object
3. In single-year mode: sums each field listed in `SECTION_NUMERIC_FIELDS[sectionId]` across all rows
4. In comparison mode: reads numeric fields from `SECTION_COMPARISON_FIELDS[sectionId]` (flattening groups if present), sums each `year::field` prefixed key
5. Delta columns are excluded from the totals object — AG Grid's `valueGetter` recomputes them automatically for pinned rows from the prefixed source keys
6. Fields where every row is `null`/`undefined` return `null` (renders as "—"), not `0` — distinguishes "no submissions" from "submitted zero"
7. `pinnedBottomRowData` is `[totalsRow]` or `[]`; passed as a prop to `AGGridViewer`
8. `AGGridViewer` runs `applyPinnedRowGuard(columnDefs)` when `pinnedBottomRowData.length > 0`
9. Guard recursively wraps only leaf columns that **already have a `cellRenderer`** — columns without one are returned untouched
10. For pinned-bottom rows, the guard replaces the original renderer with `renderPinnedCell`: `number → toLocaleString`, `null/undefined → "—"`, `string → as-is`
11. `getRowStyle` applies bold + blue top border to `rowPinned === 'bottom'` rows

## Output
- A sticky "Grand Total" row at the bottom of the grid with summed numeric values
- Numeric cells display plain bold formatted numbers — no clickable drilldown buttons
- Non-summable columns (hei_name shows "Grand Total", status/type show "—")
- Row absent entirely on Profile, Admission, Discipline, SafetySecurity sections
- Comparison mode: totals per year column; delta columns auto-calculated by AG Grid

---

## Relevant Files

| File | Role |
|------|------|
| `resources/js/Config/summaryView/summaryTotalsConfig.js` | **New.** `computeTotalsRow()`, `SECTION_NUMERIC_FIELDS`, sum logic for single-year and comparison modes |
| `resources/js/Components/Common/AGGridViewer.jsx` | Accepts `pinnedBottomRowData` prop; `applyPinnedRowGuard`; `renderPinnedCell`; `getRowStyle` |
| `resources/js/Pages/Admin/SummaryView.jsx` | `useMemo` computes `pinnedBottomRowData`; passes it to `AGGridViewer` |
| `resources/js/Config/summaryView/comparisonConfig.js` | Read-only; used by `computeTotalsRow` in comparison mode to discover numeric fields |

---

## Key Discoveries

- **`pinnedBottomRowData` is community-edition AG Grid** — no enterprise license needed. Rows are outside pagination, sorting, and filtering entirely.
- **Delta `valueGetter` columns recalculate automatically for pinned rows** — as long as the source prefixed keys (`year::field`) are present in the pinned row object, AG Grid runs the getter. No manual delta computation needed.
- **Installing a `cellRenderer` on a column that has none breaks default rendering for ALL rows** — not just the pinned one. Returning `undefined` from an installed renderer does not restore AG Grid's default behavior; the cell just goes blank. The guard must skip renderer-less columns entirely.

## Key Decisions

- **Grand total = full dataset, not current page** — totals row is computed from `sectionData` (all rows). A page-level total that changes on page flip is actively misleading.
- **`null` vs `0` distinction in `sumField`** — if no row in the dataset has a value for a field, return `null` (→ "—"), not `0`. Zero means "submitted but empty"; null means "nobody submitted anything."
- **Guard only wraps columns with existing `cellRenderer`** — columns without one (plain text fields like `hei_name`) must be left completely untouched to preserve AG Grid default rendering.
- **No section config changes** — the guard is entirely internal to `AGGridViewer`. Zero changes to any of the 15 section config files.
- **Sections excluded from totals:** `1A-Profile` (no numeric columns), `6-Admission`, `7-StudentDiscipline`, `12-SafetySecurity` (all boolean flags — summing Yes/No counts would be semantically wrong).

## Dead Ends / Avoided Paths

- **`grandTotalRow` AG Grid option** — requires Row Grouping with `aggFunc` per column; not viable without architectural overhaul.
- **`pinnedRowCellRendererSelector`** — Enterprise feature only; not available.
- **Wrapping renderer-less columns with a pass-through** — caused the `hei_name` blank regression. Definitively wrong; removed.
- **Per-section config `cellRenderer` surgery** — would require touching all 15 section configs and the comparison builder. Rejected in favour of the transparent guard inside `AGGridViewer`.
