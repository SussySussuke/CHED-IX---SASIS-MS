# MER4A Submission — Evidence Link Autofill Fix

## Input

- `resources/js/config/mer4aConfig.js` — defines `fixedRows` with IDs `sas_admin_1`–`sas_admin_5` and `guidance_1`–`guidance_3`
- `resources/js/Components/Common/SharedFormCreate.jsx` — matches DB entities to fixedRows via `e.id === fixedRow.id || e.row_id === fixedRow.id`
- `database/seeders/DemoDataSeeder.php` — `seedMer4a()` was inserting `row_id` values `sas_001`–`sas_010` and `gc_001`–`gc_009`
- `database/migrations/2025_02_05_000001_create_mer4a_tables.php` — `mer4a_submissions` had no `submitted_at` column
- `SubmissionExpand.jsx` — references `submission.submitted_at || submission.created_at`

## Process

On edit, `SharedFormCreate.jsx` receives DB entities from the controller and attempts to match each to a `fixedRow` by ID. If a match is found, the entity's `evidence_link` (and other fields) are loaded into that row's state. If no match is found, the row renders empty.

The seeder's `row_id` values (`sas_001`, `gc_001`, etc.) never matched the config's `fixedRow.id` values (`sas_admin_1`, `guidance_1`). Every single row fell through to the empty fallback. Data existed in the DB but was never connected to the UI.

## Output

- Editing an existing MER4A submission now correctly autofills `evidence_link`, `status_compiled`, and `hei_remarks` for all rows.
- `submitted_at` column now exists on `mer4a_submissions` — `SubmissionExpand` display no longer silently falls back to `created_at`.
- `MER4ASubmission` model: `submitted_at` added to `$fillable` and `$casts`.

## Relevant Files

| File | Change |
|---|---|
| `database/seeders/DemoDataSeeder.php` | `seedMer4a()` — row IDs and requirement texts aligned to config; 10 SAS rows → 5, 9 GC rows → 3 |
| `database/migrations/2025_02_05_000001_create_mer4a_tables.php` | Added `submitted_at` nullable timestamp to `mer4a_submissions` |
| `app/Models/MER4ASubmission.php` | `submitted_at` added to `$fillable` and `$casts` |
| `resources/js/config/mer4aConfig.js` | Source of truth for fixedRow IDs — **do not change IDs here without updating the seeder** |
| `resources/js/Components/Common/SharedFormCreate.jsx` | Matching logic was already correct; no changes needed |
| `app/Http/Controllers/HEI/MER4AController.php` | No changes needed |

## Key Discoveries

- The seeder and the frontend config were written independently and never agreed on IDs or row count. The config is the source of truth — the seeder must follow it.
- `SharedFormCreate.jsx` matching logic (`e.id === fixedRow.id || e.row_id === fixedRow.id`) is correct and generic. Any MER form using `fixedRows` is only as good as its seeder/DB `row_id` values matching the config.
- The seeder previously embedded the `evidence_link` lookup as an inline array keyed by `$rowId` inside the foreach. This is fragile — replaced with a separate `$gcLinks` / `$sasLinks` array defined before the loop.

## Decisions Made

- Config IDs (`sas_admin_1`–`sas_admin_5`, `guidance_1`–`guidance_3`) are treated as the single source of truth. The seeder was changed to match the config, not the other way around.
- Seeder requirement text now matches the config requirement text exactly — prevents future divergence causing confusion in admin review.
- `submitted_at` added as nullable — existing rows unaffected; the controller does not yet populate it automatically, but the column is ready for future use.
