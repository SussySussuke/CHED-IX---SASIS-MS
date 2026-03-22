# Submissions List — Form Filter Grouping Bug

## Input
Form filter dropdown (Select Form) in the HEI Submissions page showed "Profile" appearing visually as a section/group header with blank data underneath, when academic year had only one tag.

## Process
`SubmissionFilters.jsx` builds `formSelectOptions` for HEI mode via `buildFormOptionsGrouped()`, which returns three grouped arrays: `Institutional Forms`, `MER Forms`, `Student Services Annexes`. The code was injecting `{ value: 'all', label: 'All Forms' }` directly into `grouped[0].options` — the `Institutional Forms` group. This made `SearchableSelect` render `All Forms` and `1A - Profile` as siblings under the `Institutional Forms` group header, causing `1A - Profile` to visually read like a sub-section label.

## Root Cause
`All Forms` was bolted onto the first group's options array instead of being its own top-level entry. The number of academic year tags was a red herring — it changed what was visible in the list, making the misrendering more obvious.

## Output
Fixed in two files:
- `SubmissionFilters.jsx`: `All Forms` now lives in `{ group: '', options: [{ value: 'all', label: 'All Forms' }] }` prepended before all groups.
- `SearchableSelect.jsx`: Group header `<div>` only renders when `group.group` is truthy. Items in an empty-label group use `px-4` instead of `pl-8`.

## Relevant Files
- `resources/js/Components/Submissions/SubmissionFilters.jsx`
- `resources/js/Components/Form/SearchableSelect.jsx`
- `resources/js/Config/formConfig.js` — `buildFormOptionsGrouped()`
- `resources/js/Config/nonAnnexForms.js` — `SUMMARY_FORM.category = 'Institutional Forms'`

## Key Discoveries
- `SearchableSelect` detects grouping via `options[0].hasOwnProperty('group')`. Even `group: ''` triggers grouped mode — empty-string group labels must be guarded in the renderer.
- `1A - Profile` is the label of the SUMMARY option, not a group name. Injecting it into a named group made it visually indistinguishable from a header.

## Decisions Made
- Empty-string group name is the convention for an ungrouped top-level item within a grouped select. Consistent with React-Select and MUI patterns.
- Fix scoped to `SubmissionFilters.jsx` (data shape) and `SearchableSelect.jsx` (render guard). `formConfig.js` untouched.
