# RecordsModal — Category Assignment: Checkbox → SearchableSelect

## Input
- `RecordsModal.jsx` — `MultiCategoryCell` rendered a group of checkboxes allowing multi-select of categories per row inside an AG Grid cell
- `SearchableSelect.jsx` — existing single-select searchable dropdown; dropdown rendered `position: absolute z-50` inside the component tree
- Requirement: one category per record only; replace checkbox group with a searchable dropdown

## Process
1. Replaced `checked: Set` multi-state with `selected: string` single-value state in `MultiCategoryCell`
2. Added a `RESET_VALUE = '__reset__'` sentinel as the first option, replacing the separate "Reset to keyword matching" trash button
3. `isDirty` simplified from sorted-array string comparison to `selected !== initialValue`
4. `categoriesToSave` is `[]` when sentinel selected, otherwise `[selected]` — backend array shape unchanged
5. Discovered dropdown options were invisible when open: `position: absolute z-50` is clipped by AG Grid cell stacking contexts and `overflow: hidden` on parent rows
6. Added `usePortal` prop to `SearchableSelect` — when true, renders dropdown via `ReactDOM.createPortal` into `document.body` using `position: fixed` coordinates from `getBoundingClientRect()` at `z-index: 99999`
7. Passed `usePortal` on the `SearchableSelect` inside `RecordsModal`
8. `getRowHeight` for recategorize rows simplified (no longer scales with option count)

## Output
- `SearchableSelect.jsx` — new `usePortal` prop (default `false`); all existing usages unaffected
- `RecordsModal.jsx` — `MultiCategoryCell` uses `SearchableSelect` with `usePortal`; single-select enforced; reset sentinel replaces trash button; `IoTrash` import removed; banner text updated
- No backend changes — `categories` payload remains a nullable array; sending `[singleValue]` or `[]` was already valid

## Relevant Files

| File | Role |
|------|------|
| `resources/js/Components/Modals/RecordsModal.jsx` | `MultiCategoryCell` — category assignment UI per row |
| `resources/js/Components/Form/SearchableSelect.jsx` | Dropdown component; owns `usePortal` logic |
| `app/Http/Controllers/Admin/SummaryViewController.php` | `update*Category` methods — accept `categories` as nullable array |

## Key Discoveries
- AG Grid cells create their own stacking contexts and often have `overflow: hidden` on row wrappers — `position: absolute` dropdowns are clipped regardless of z-index value
- The fix is a portal: render the dropdown into `document.body` with `position: fixed` coordinates computed at open time via `getBoundingClientRect()`. This escapes all parent stacking contexts entirely
- `usePortal` must default to `false` — the component is used in normal page filters and forms where portal is unnecessary and would break scroll-tracking
- Records that previously had multiple categories assigned: `initialValue` takes only `validAssigned[0]`, silently normalising to single on next save. No data migration needed; the backend field is still an array

## Decisions Made
- `RESET_VALUE = '__reset__'` sentinel string rather than `null`/`''` — `SearchableSelect` needs a non-empty string to render a selected state; sentinel is stable, never a real category key
- Portal position computed once on open (`useEffect` on `isOpen`), not on scroll — acceptable since the modal is not scrollable while the dropdown is open
- `usePortal` is opt-in on `SearchableSelect`, not the default — avoids breaking existing usages and keeps the prop self-documenting at the call site
