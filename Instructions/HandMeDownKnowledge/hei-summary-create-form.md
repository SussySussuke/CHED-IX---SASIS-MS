# HEI Summary (1A-Profile) Create/Edit Form

## Feature
HEI-side form for submitting or editing the Summary (1A-Profile) submission. Accessible at `/hei/summary/create`.

## Files
- `resources/js/Pages/HEI/Forms/SummaryCreate.jsx` — main form page
- `resources/js/Components/Forms/MultiTextInput.jsx` — multi-value text input used for `social_media_contacts`

## Input → Process → Output

**Input:** Inertia props — `availableYears`, `existingSubmissions` (keyed by academic year), `defaultYear`, `isEditing`

**Process:**
- Year is read from URL param (`?year=`) or `defaultYear` prop via `getAcademicYearFromUrl()`
- `useForm` initializes from `existingSubmissions[selectedYear]` if present
- `useEffect` re-syncs form data when `selectedYear` changes
- Population total auto-calculated from male + female + intersex via a second `useEffect`
- Submits via Inertia `post('/hei/summary')`

**Output:** Inertia POST to `/hei/summary`

## Key Discovery: `social_media_contacts` Type Mismatch

### Problem
`social_media_contacts` is stored in the DB as a JSON-encoded string (e.g. `"[\"fb.com/x\"]"`). Laravel/Inertia passes it to the frontend as a raw string. `MultiTextInput` calls `values.map()` on this prop — `.map()` does not exist on strings → `TypeError: values.map is not a function` → React crash on page load.

The error surface was misleading: React's error overlay blamed `<MultiTextInput>` and showed a generic component stack trace with no actual exception message visible until an `ErrorBoundary` was added.

### Fix
`toContactsArray(val)` normalizer added above the component in `SummaryCreate.jsx`:
- If already a non-empty array → return as-is
- If a string → attempt `JSON.parse`, return parsed array or fall back to `[val]`
- Otherwise → return `['']`

Applied at **two sites** in the file:
1. `useForm(...)` initial state
2. `useEffect(...)` year-change sync

`|| ['']` alone is insufficient — it only catches `null`/`undefined`, not a non-empty string.

## Decision
Normalization lives in the consumer (`SummaryCreate.jsx`), not in `MultiTextInput`, because the type contract of `MultiTextInput` is correct (it expects an array). The problem is the server returning a string. If other forms use `MultiTextInput` with DB-backed array fields, they need the same normalizer pattern.

## Dead End
The `stream.Readable` Vite error (from `xlsx-js-style`) was crashing the same page and masking this bug. That crash was fixed first (see `excel-export-summaryview.md`). Once resolved, the `values.map` error became the new surface — still hidden until a temporary `ErrorBoundary` was added to `SummaryCreate.jsx` to expose the real exception message.
