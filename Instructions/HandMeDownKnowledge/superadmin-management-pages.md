# SuperAdmin Management Pages

## Feature Scope
SuperAdmin can now manage Admin accounts, HEI accounts, and CHED Contacts — mirroring what Admin can already do — from within the SuperAdmin panel.

---

## Input
- `role:superadmin` middleware-protected routes under `/superadmin/` prefix
- Same form fields as their Admin counterparts (no new schema, no new migrations)
- `CheckRole` middleware does strict `account_type !== $role` — superadmin cannot hit `role:admin` routes, so shared routes were never an option

---

## Process

### Service extraction (applied to two features this session)
Business logic was extracted from Admin controllers into shared Services so both Admin and SuperAdmin controllers delegate to one place:

| Service | Extracted from |
|---|---|
| `app/Services/HEIManagementService.php` | `Admin/HEIManagementController` |
| `app/Services/CHEDContactService.php` | `Admin/CHEDContactController` |

Both Admin controllers were refactored to thin HTTP controllers (validate → call service → redirect). SuperAdmin controllers are identical in structure but redirect to `superadmin.*` named routes and render `SuperAdmin/*` Inertia views.

`AdminManagementController` (SuperAdmin) had no service extracted — its logic was already simple enough and is superadmin-only with no Admin equivalent.

### Frontend pattern
- `AdminManagement.jsx` was upgraded from a plain `<table>` to `AGGridViewer` + `ConfirmationModal` + `IconButton` + `StatusBadge` to match the quality of `HEIAccounts.jsx`
- All three SuperAdmin pages use `SuperAdminLayout`, identical component stack to Admin equivalents

---

## Output

### New files
| File | Purpose |
|---|---|
| `app/Services/HEIManagementService.php` | Shared HEI CRUD + audit logic |
| `app/Services/CHEDContactService.php` | Shared CHED contact CRUD + reorder + audit logic |
| `app/Http/Controllers/SuperAdmin/HEIManagementController.php` | Thin controller, delegates to `HEIManagementService` |
| `app/Http/Controllers/SuperAdmin/CHEDContactController.php` | Thin controller, delegates to `CHEDContactService`. No `getActiveContacts` — that's a public API belonging to Admin only |
| `resources/js/Pages/SuperAdmin/HEIAccounts.jsx` | SuperAdminLayout + `/superadmin/heis/...` paths |
| `resources/js/Pages/SuperAdmin/CHEDContacts.jsx` | SuperAdminLayout + `/superadmin/ched-contacts/...` paths including axios reorder call |

### Modified files
| File | Change |
|---|---|
| `app/Http/Controllers/Admin/HEIManagementController.php` | Refactored to thin controller using `HEIManagementService` |
| `app/Http/Controllers/Admin/CHEDContactController.php` | Refactored to thin controller using `CHEDContactService` |
| `resources/js/Pages/SuperAdmin/AdminManagement.jsx` | Replaced plain table with AGGridViewer; replaced inline delete modal with `ConfirmationModal`; added `IconButton` + `StatusBadge`; fixed password visibility state not resetting on modal open |
| `routes/web.php` | Added aliased imports for both SuperAdmin controllers; added 4 HEI routes + 5 CHED contact routes inside `role:superadmin` group |
| `resources/js/Layouts/SuperAdminLayout.jsx` | Added `IoSchool`, `IoCall` icon imports; added "HEI Accounts" and "CHED Contacts" sidebar links |

### Sidebar order (SuperAdmin)
Dashboard → Admin Management → HEI Accounts → CHED Contacts → System Audit Logs → Settings

---

## Key Discoveries
- `CheckRole` middleware is a strict string match on `account_type` — there is no role hierarchy, no inheritance. SuperAdmin cannot reach Admin routes without its own route set.
- `CHEDContactController::getActiveContacts` is a public JSON API used by HEI users via `ContactAdminModal`. It lives only on the Admin controller and its public route — SuperAdmin does not need a duplicate of this.
- The `reorder` endpoint is called via `axios.post` directly (not Inertia router), so the SuperAdmin CHED Contacts page also uses `axios.post('/superadmin/ched-contacts/reorder', ...)`. Route ordering is safe because `reorder` is POST and `{contact}` CRUD uses PUT/DELETE — no method collision.

---

## Decisions Made
- **Service extraction over controller duplication** — README explicitly forbids duplicating controllers for the same logic. Services were the correct abstraction.
- **No new migrations, models, or routes outside superadmin prefix** — feature is purely access-layer, not data-layer.
- **SuperAdmin `CHEDContactController` omits `getActiveContacts`** — it's a public-facing API for HEI users, not an admin management action. Duplicating it under superadmin would be meaningless.

---

# SuperAdmin Dashboard

## Feature Scope
SuperAdmin dashboard mirrors the Admin dashboard exactly, plus one extra stat card: **Total Admins**. All charts, tables, and year-selector are shared via the same components and a new `DashboardService`.

## Input
- `?year=` query param (defaults to current academic year)
- `role:superadmin` middleware — closure route replaced with a real controller

## Process
- All dashboard query logic extracted from `Admin/DashboardController` into `app/Services/DashboardService.php`
- `getTotalAdmins()` is a public method on `DashboardService`, called only by the SuperAdmin controller and appended to the shared `$stats` array before passing to Inertia
- Cache key is shared (`admin_dashboard_stats_{year}`) — both dashboards read the same cached result; SuperAdmin just adds `totalAdmins` on top (uncached, cheap COUNT query)
- Admin `DashboardController` refactored to thin controller delegating to `DashboardService`

## Output

### New files
| File | Purpose |
|---|---|
| `app/Services/DashboardService.php` | All dashboard stats logic: pending reviews, completion rate, enrollment/HEI distribution, recent submissions, top HEIs, form completion rates, academic year helpers |
| `app/Http/Controllers/SuperAdmin/DashboardController.php` | Thin controller — calls service, appends `totalAdmins`, renders `SuperAdmin/Dashboard` |

### Modified files
| File | Change |
|---|---|
| `app/Http/Controllers/Admin/DashboardController.php` | Refactored to thin controller using `DashboardService` |
| `resources/js/Pages/SuperAdmin/Dashboard.jsx` | Full rebuild — `AdminYearHeader`, `EnrollmentDistributionChart`, `HEITypeDistributionChart`, `RecentSubmissionsTable`, `TopPerformingHEIs`, `FormCompletionChart` all reused; added Total Admins `StatCard` as a 3rd card in the top row |
| `routes/web.php` | Replaced inline closure with `[SuperAdminDashboardController::class, 'index']`; added import alias |

## Key Discoveries
- The original SuperAdmin dashboard route was an inline closure passing zero data — `stats` was always undefined on the frontend.
- Cache key `admin_dashboard_stats_{year}` is shared between Admin and SuperAdmin — intentional, they show the same data. `totalAdmins` is not cached because it's a trivial COUNT and is superadmin-only.
- All Admin dashboard child components (`AdminYearHeader`, charts, tables) are layout-agnostic — they accept props only, no layout assumptions, so they work inside `SuperAdminLayout` without modification.

## Decisions Made
- **Shared cache key** — Admin and SuperAdmin dashboards show identical HEI stats; no reason to duplicate the cache entry.
- **`totalAdmins` outside cache** — Appended after cache retrieval so it doesn't bleed into the Admin dashboard's cached payload.
