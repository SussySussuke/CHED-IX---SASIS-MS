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
3. **Before updating:** query all 24 models for distinct `hei_id` + `academic_year` pairs matching `status = 'submitted' AND created_at < $deadline`. Store for cache invalidation.
4. If no affected pairs found → exit early with no-op.
5. Wrap all 24 bulk `UPDATE status = 'published'` calls in a single `DB::transaction`. All-or-nothing — partial failure rolls back entirely.
6. **After update:** call `CacheService::clearSubmissionCaches()` and `CacheService::clearHeiCaches()` per affected HEI/year pair. Clear `admin_dashboard_stats_{year}` per affected year.
7. Write one `AuditLog::logSystem()` entry summarising the bulk publish (total count, affected pairs, deadline used).

**Critical behavior:** The `created_at < $deadline` condition has no academic year filter. Any `submitted` record from any year (e.g. 2016) that was never approved will be auto-published when the command runs.

---

## Output
- Console output: per-model published counts, grand total, cache invalidation summary, audit log confirmation.
- DB: affected rows have `status` → `'published'`, `updated_at` → now.
- Cache: all affected HEI dashboard, checklist, activity, submission list, and admin dashboard caches are cleared immediately.
- `audit_logs`: one system entry with `user_name = 'System'`, `user_role = 'system'`, `action = 'published'`.

---

## Relevant Files
- `app/Console/Commands/PublishSubmittedBatches.php` — the command
- `app/Models/Setting.php` — `getDeadline()` and `isPastDeadline()` methods
- `app/Models/AuditLog.php` — `logSystem()` static method (CLI-safe, no auth() dependency)
- `app/Services/CacheService.php` — `clearSubmissionCaches()` and `clearHeiCaches()`
- `app/Http/Controllers/Admin/AuditLogController.php` — now queries `whereIn('user_role', ['admin', 'system'])` so system logs appear in UI
- `app/Http/Controllers/HEI/BaseAnnexController.php` — `getDefaultYear()` uses `isPastDeadline()` to shift the UI default year after deadline
- `app/Http/Controllers/HEI/SubmissionController.php` — `getDefaultAcademicYear()` also uses `isPastDeadline()`
- `app/Http/Controllers/Admin/SubmissionController.php` — manual single-record `approve()` method (separate from this command)
- `resources/js/Config/formConfig.js` — `PRIORITY_ORDER` is the canonical list of all 24 form types; `$allModels` must match it
- `database/migrations/2026_03_18_000001_update_audit_logs_for_system_actor.php` — adds `'system'` to `user_role` enum, makes `user_id` nullable

---

## Key Discoveries
- Original command had `GeneralInformation::class` — model does not exist. Fatal error at runtime.
- 9 of 24 form types were missing from original command (all MER forms, Summary, C1, I1, L1, N1).
- Two separate loops (`$batchModels` / `$submissionModels`) were redundant. Collapsed into one `$allModels`.
- `AuditLog::log()` calls `auth()->user()` and `request()->ip()` — both null in CLI context. Cannot be used from artisan commands without a dedicated system variant.
- `user_id` on `audit_logs` had a non-nullable FK constraint — must be made nullable before system logs can be inserted.
- `user_role` enum only had `superadmin` and `admin` — `system` was not a valid value.
- `AuditLogController` was filtering `user_role = 'admin'` only — system logs would have been invisible in the UI without the fix.
- `admin_dashboard_stats_{year}` cache key is not managed by `CacheService` — it is a freeform key used directly via `Cache::forget()` in `Admin/SubmissionController` and now also in this command.

---

## Decisions Made
- Affected HEI/year pairs are collected **before** the bulk update, not after. Bulk UPDATE returns only a count — the rows are gone from the query by the time UPDATE completes.
- Single `DB::transaction()` wraps all 24 model updates. If any model fails mid-loop, the entire operation rolls back.
- One summary audit log entry per command run (not one per model or per row). Sufficient for traceability without polluting the log table.
- `AuditLog::logSystem()` added as a separate method (not overloading `log()`) to keep CLI and web contexts explicitly distinct.
- `AuditLogController` now includes `system` role in its queries so these entries are visible at `/admin/audit-logs`.
- No academic year filter on the publish query — intentional. The command publishes ALL pending submitted records across all years, not just the current cycle.
