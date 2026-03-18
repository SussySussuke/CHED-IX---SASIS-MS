# Submission Auto-Publish — Deadline Command

## Feature
`PublishSubmittedBatches` artisan command auto-publishes all `submitted` records once the annual deadline passes.

---

## Input
- `Setting::getDeadline()` — reads `annual_submission_deadline` from the `settings` table, strips the stored year, and applies the **current calendar year** to the month/day/time. The deadline is year-agnostic by design.
- `--force` flag — bypasses the deadline check, publishes immediately regardless of date.
- All 24 form model tables, queried for `status = 'submitted'` AND `created_at < $deadline`.

---

## Process
1. Resolve deadline from `Setting::getDeadline()`. Abort if none configured.
2. If current datetime ≤ deadline and `--force` not set → exit with no-op.
3. Loop through all 24 models in `$allModels` array.
4. For each model: bulk `UPDATE status = 'published'` where `status = 'submitted'` AND `created_at < $deadline`.
5. Log count per model, sum total published.

**Critical behavior:** The `created_at < $deadline` condition has no academic year filter. Any `submitted` record from any year (including 2016, 2010, etc.) that was never approved will be auto-published when the command runs.

---

## Output
- Console output: per-model published counts + grand total.
- DB: affected rows have `status` → `'published'`, `updated_at` → now.
- No audit log entries are created by this command.

---

## Relevant Files
- `app/Console/Commands/PublishSubmittedBatches.php` — the command
- `app/Models/Setting.php` — `getDeadline()` and `isPastDeadline()` methods
- `app/Http/Controllers/HEI/BaseAnnexController.php` — `getDefaultYear()` uses `isPastDeadline()` to shift the UI default year after deadline
- `app/Http/Controllers/HEI/SubmissionController.php` — `getDefaultAcademicYear()` also uses `isPastDeadline()`
- `app/Http/Controllers/Admin/SubmissionController.php` — manual single-record `approve()` method (separate from this command)
- `resources/js/Config/formConfig.js` — `PRIORITY_ORDER` is the canonical list of all 24 form types; `$allModels` must match it

---

## Key Discoveries
- Original command had `GeneralInformation::class` in `$submissionModels` — **this model does not exist** anywhere in the codebase. Would throw a fatal error at runtime.
- `AnnexC1Batch`, `AnnexI1Batch`, `AnnexL1Batch`, `AnnexN1Batch`, `Summary`, `MER1Submission`, `MER2Submission`, `MER3Submission`, `MER4ASubmission` were all **missing** from the original command — 9 of 24 form types were never going to be auto-published.
- The two separate loops (`$batchModels` / `$submissionModels`) were redundant — identical operations. Collapsed into one `$allModels` loop.
- `use Illuminate\Support\Facades\DB;` was imported but unused. Removed.

---

## Decisions Made
- Merged `$batchModels` and `$submissionModels` into a single `$allModels` array. No behavioral difference — all models use the same bulk update query.
- `$allModels` order follows `PRIORITY_ORDER` from `formConfig.js` for maintainability and traceability.
- No academic year filter was added intentionally — the command is designed to publish ALL pending `submitted` records across all years, not just the current cycle. This is expected behavior per the edge case analysis.

---

## To Be Fixed Soon
- **No audit log** is created when this command publishes records. Manual `approve()` in `Admin/SubmissionController.php` does create audit logs. This inconsistency means bulk auto-publish leaves no trace in `audit_logs`.
