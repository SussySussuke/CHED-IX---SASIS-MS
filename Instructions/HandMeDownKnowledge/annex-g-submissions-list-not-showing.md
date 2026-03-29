# Annex G — Submissions List Not Showing Data

## Input
Annex G submissions existed in the DB and exported fine, but the Submissions List page showed "No data" for Annex G. When the row was visible and expanded, the two tables (Other Publications, Programs/Activities) were empty.

## Process
Traced from `SubmissionsList.jsx` → `useSubmissionFilters` → `SubmissionController::getSubmissions()` → `FormConfigService::getAnnexTypes()` → `AnnexGSubmission` model → `sharedRendererConfig.js` → `ANNEX_G_CONFIG`.

## Root Causes (four bugs, all in mapping/config layer — not SQL)

**Bug 1 — `batch_id` wrong in both HEI and Admin `SubmissionController`:**
`getSubmissions()` loop used `$batch->batch_id ?? $batch->id` for all annexes. `AnnexGSubmission` has no `batch_id` column — it uses `submission_id` (UUID). Fallback to integer PK was passed as `batch_id` to the frontend, mismatching the key used by `SubmissionExpand` and the fetch URL.

**Bug 2 — `formSection.key: 'batch'` in `ANNEX_G_CONFIG`:**
`SharedRenderer::renderHybrid()` reads `data[config.formSection.key]`. Backend returns `form_data` as the key, not `batch`. Result: `formData` was `undefined` → renderer bailed with "No data available" before rendering anything.

**Bug 3 — `form_data` response incomplete in both controllers:**
`getBatchData()` for G only returned 4 fields. Missing: `adviser_position_designation`, all `frequency_*` booleans, all `publication_type_*` booleans.

**Bug 4 — Wrong column `field` names in `ANNEX_G_CONFIG` table sections:**
`other_publications` used `publication_name`, `description` — actual fields: `name_of_publication`, `department_unit_in_charge`, `type_of_publication`.
`programs` used `program_activity`, `date_conducted`, `participants` — actual fields: `title_of_program`, `implementation_date`, `implementation_venue`, `target_group_of_participants`.

## Output
All four bugs fixed. Annex G rows appear in the submissions list, expand correctly, form fields display, both tables populate.

## Relevant Files
- `app/Http/Controllers/HEI/SubmissionController.php` — `getSubmissions()` and `getBatchData()` for G
- `app/Http/Controllers/Admin/SubmissionController.php` — same two methods
- `app/Models/AnnexGSubmission.php` — uses `submission_id` (UUID), no `batch_id`
- `app/Models/AnnexGOtherPublication.php` — actual field names
- `app/Models/AnnexGProgram.php` — actual field names
- `resources/js/Config/sharedRendererConfig.js` — `ANNEX_G_CONFIG`
- `resources/js/Components/Submissions/renderers/SharedRenderer.jsx` — `renderHybrid()`
- `app/Services/FormConfigService.php` — G is registered correctly here (not the problem)
- `resources/js/Config/annexConfigs/form2Annexes.js` — G intentionally absent; this file is only for Handsontable editor columns, not the renderer

## Key Discoveries
- `AnnexGSubmission` is a submission-per-year model (like D), not a batch model. `submission_id` UUID is its logical key. Code that generically reads `batch_id` silently falls back to integer PK — may accidentally resolve in DB lookups but breaks frontend key consistency.
- `form2Annexes.js` missing G is intentional and unrelated to this bug.
- Cache clear alone cannot fix this — data was never mapped correctly before hitting the cache.
- `ANNEX_G_CONFIG` table column field names were invented and matched neither the DB schema nor the models.

## Decisions Made
- `batch_id` in `getSubmissions()` now uses `submission_id` for annexes D and G — identical logic to what `route_id` already used. Applied to both HEI and Admin controllers.
- `form_data` response expanded to include all fields the renderer config references. Both controllers updated identically.
- Column field names corrected to match model `$fillable`. No DB or model changes needed.

---

## Follow-up: AnnexGCreate Editor Bugs

### Input
After fixing the submissions list, the Annex G editor (`AnnexGCreate.jsx`) had two pre-existing bugs: Actions column rendered as literal text `<button c...>` instead of an icon button, and a React ref warning in the console.

### Root Causes

**Bug 5 — HTML string `cellRenderer` broken in AG Grid v33+:**
All three table column definitions (Editorial Board, Other Publications, Programs) used `cellRenderer` returning an HTML string. AG Grid v33+ dropped support for this — strings are rendered as literal text, not parsed as HTML. Requires a function returning a real DOM element.

**Bug 6 — Dead `useRef` passed to non-forwardRef component:**
`AnnexGCreate.jsx` declared three `useRef` instances (`editorialBoardRef`, `otherPublicationsRef`, `programsRef`) and passed them as `ref` props to `AGGridEditor`. `AGGridEditor` is a plain function component with no `forwardRef` — refs silently fail and React warns. The refs were never used for anything.

### Output
- Replaced all three string `cellRenderer`s with a shared `makeDeleteCellRenderer(tableType)` factory that returns a real DOM `button` element with a direct `addEventListener` click handler.
- Removed the old `document.addEventListener('click', handleClick)` delegation `useEffect` — it was the workaround for the string renderer and is now dead code.
- Removed all three `useRef` declarations and their `ref={...}` props from `AGGridEditor` usages.
- Removed `useRef` from the React import.

### Relevant Files
- `resources/js/Pages/HEI/Forms/AnnexGCreate.jsx`
- `resources/js/Components/Common/AGGridEditor.jsx` — does NOT use `forwardRef`; refs passed to it always fail silently

### Key Discoveries
- The same HTML string `cellRenderer` pattern likely exists in other `AnnexXCreate.jsx` files — they would have the same broken Actions column. Not fixed here; only G was in scope.
- AG Grid v33+ requires `cellRenderer` to return a DOM element or a React component class — HTML strings are a v32 and earlier pattern.
- Vite HMR may cache the old module version; a hard refresh (`Ctrl+Shift+R`) is needed to pick up the fix if the warning persists after saving.

---

## Follow-up: AG Grid v33 React Child Crash + Edit Autofill Missing

### Input
- `AnnexGCreate.jsx` crashed on open with `Objects are not valid as a React child (found: [object HTMLButtonElement])` spammed in console — page completely broken.
- `AnnexHCreate.jsx` had the same class of bug (HTML string renderer).
- On the edit flow (clicking Edit in submission list), all scalar fields were blank: Official School Name, Student Publication Name, Publication Fee, all Frequency checkboxes, all Publication Type checkboxes, Adviser Name, Adviser Position. Tables (Editorial Board, Other Publications, Programs) populated correctly.

### Root Causes

**Bug 7 — `makeDeleteCellRenderer` returned a raw DOM node (AnnexGCreate):**
The previous session's fix replaced HTML strings with `document.createElement('button')` returning a DOM node. AG Grid v33+ with the React renderer passes `cellRenderer` output directly into React's render tree — a raw `HTMLButtonElement` is not a valid React child, causing the crash. Requires JSX, not DOM nodes.

**Bug 8 — HTML string `cellRenderer` in AnnexHCreate + global click workaround:**
`AnnexHCreate.jsx` statistics Actions column used an HTML string renderer. Same v33 issue. A `useEffect` with `document.addEventListener('click', ...)` was the compensating workaround — it checked `closest('.delete-row-btn')` on every click in the document. Fragile and unnecessary once the renderer is JSX.

**Bug 9 — `edit()` in `AnnexGController` nested scalar fields under `formData` key:**
The `edit()` method built `existingBatches` with all scalar fields wrapped in a `formData` sub-object. The frontend reads them directly off the batch root (`batch?.official_school_name`), which is how `getExistingBatches()` (used by `create()`) returns them — flat on the model. The `formData` nesting made all scalar fields `undefined` on load, while relations (`editorialBoards`, etc.) were at root level and populated fine.

### Output
- `AnnexGCreate.jsx`: `makeDeleteCellRenderer` now returns JSX with camelCase React SVG attributes (`strokeLinecap`, `strokeLinejoin`, `strokeWidth`, `onClick`).
- `AnnexHCreate.jsx`: statistics Actions column `cellRenderer` converted to JSX with direct `onClick`. Global `document.addEventListener` `useEffect` removed. `useRef` import and unused `servicesRef`/`statisticsRef` declarations and `ref` props removed.
- `AnnexGController.php` `edit()`: removed `formData` wrapper — all scalar fields now sit flat in the batch array, matching `getExistingBatches()` output.

### Relevant Files
- `resources/js/Pages/HEI/Forms/AnnexGCreate.jsx`
- `resources/js/Pages/HEI/Forms/AnnexHCreate.jsx`
- `app/Http/Controllers/HEI/AnnexGController.php` — `edit()` method

### Key Discoveries
- AG Grid v33+ with React renderer: `cellRenderer` must return JSX. Raw DOM nodes crash React with "Objects are not valid as a React child". HTML strings render as literal text. Both are pre-v33 patterns.
- Any `AnnexXController` whose `edit()` manually constructs `existingBatches` (instead of delegating to `getExistingBatches()`) is a candidate for this nesting mismatch. Check all custom `edit()` implementations against what the frontend reads.
- The pattern to check: frontend reads `batch?.field_name` (flat). If `edit()` wraps fields in any sub-key, they silently resolve to `undefined` with no error thrown.
