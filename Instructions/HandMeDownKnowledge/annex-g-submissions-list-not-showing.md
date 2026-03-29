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
