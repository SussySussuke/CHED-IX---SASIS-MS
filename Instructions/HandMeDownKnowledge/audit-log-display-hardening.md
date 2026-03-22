# Audit Log Display Hardening

## Input
- AuditLogsTable.jsx was rendering old_values/new_values as raw JSON via `JSON.stringify` inside a `<pre>` block.
- Both controllers (Admin/AuditLogController, SuperAdmin/SystemAuditLogController) had identical `->through()` transforms mapping Eloquent model fields to arrays inline — duplicated logic.
- Raw DB column names (uii, is_active, established_at, etc.) were leaking to the frontend as object keys.

## Process
1. Created `app/Http/Resources/AuditLogResource.php` — single source of truth for what fields are sent to the frontend.
2. Replaced both `->through()` blocks with `AuditLogResource::collection($query->paginate(50))`.
3. Added `FIELD_LABELS` map inside the Resource keyed by entity type (HEI, User, CHED Contact, Submission, Setting) — renames DB column keys to human-readable labels before sending.
4. Unknown keys fall back to auto title-case (`some_field` → `Some Field`).
5. Replaced `<pre>JSON.stringify</pre>` in the modal with a `ValuesTable` component — renders a striped key-value table. Booleans → Yes/No, nulls → italic "null", arrays → comma-joined string.

## Output
- `app/Http/Resources/AuditLogResource.php` — created
- `app/Http/Controllers/Admin/AuditLogController.php` — `->through()` removed
- `app/Http/Controllers/SuperAdmin/SystemAuditLogController.php` — `->through()` removed
- `resources/js/Components/Admin/AuditLogsTable.jsx` — ValuesTable component added, JSON.stringify blocks removed

## Relevant Files
- `app/Http/Resources/AuditLogResource.php`
- `app/Http/Controllers/Admin/AuditLogController.php`
- `app/Http/Controllers/SuperAdmin/SystemAuditLogController.php`
- `app/Services/HEIManagementService.php` — logs HEI create/update/delete with raw field arrays
- `app/Services/CHEDContactService.php` — logs CHED Contact with raw field arrays
- `app/Http/Controllers/SuperAdmin/AdminManagementController.php` — logs User with raw field arrays
- `app/Http/Controllers/SuperAdmin/SettingsController.php` — logs Submission/Setting
- `app/Models/AuditLog.php` — stores old_values/new_values as JSON casts; has getActionColorAttribute and getEntityTypeColorAttribute accessors
- `resources/js/Components/Admin/AuditLogsTable.jsx`

## Key Discoveries
- Services correctly store raw DB column names in the DB — that is intentional. The label mapping belongs in the Resource (presentation layer), not the Service (data layer).
- `app/Http/Resources/` directory did not exist — was created fresh.
- `AuditLogsTable.jsx` had its own inline modal (not using Modal.jsx or RecordsModal.jsx). Left as-is since it works; refactor to Modal.jsx is a candidate for a future cleanup.

## Decisions Made
- Labels are mapped per entity type in `FIELD_LABELS` inside the Resource. New entity types need to be added there manually as the system grows.
- Kept raw column names in the DB — do not change this. The Resource handles presentation only.
- `ValuesTable` lives inside `AuditLogsTable.jsx` as a private component (not exported to Common) since it is only used there.
