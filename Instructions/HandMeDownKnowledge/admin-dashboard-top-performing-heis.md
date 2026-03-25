# Admin Dashboard — Top Performing HEIs

## Input
- `TopPerformingHEIs.jsx` showed top 5 HEIs in the widget and all HEIs in a searchable modal.
- Cards were not clickable — no navigation to the HEI's submission detail page.
- No indication of how many forms an HEI was missing.
- `DashboardService::getTopPerformingHEIs()` loop used `foreach ($allForms as $config)` — discarding the `$code` key.
- `missingForms` count was not in the payload at all.

## Process
1. Added `missingForms` counter to the existing per-HEI loop in `getTopPerformingHEIs()` — increments on `else` and on `catch`. Zero extra DB queries; derived from the same loop already running.
2. Fixed loop signature to `foreach ($allForms as $code => $config)` for consistency with sibling methods.
3. `missingForms` is now included in both `topHEIs` and `allHEIs` payloads (same method, hits both).
4. In `TopPerformingHEIs.jsx`, added `router.visit()` from `@inertiajs/react` on card click — navigates to `/admin/submissions/{hei.id}`.
5. Added `cursor-pointer` and `hover:border-blue-300` to card for visual affordance.
6. Added a red `{n} missing` badge inside the progress row — only renders when `missingForms > 0`.

## Output
- `app/Services/DashboardService.php` — `missingForms` added to payload, loop key fixed
- `resources/js/Components/Admin/TopPerformingHEIs.jsx` — cards clickable, missing badge added

## Relevant Files
- `app/Services/DashboardService.php` — `getTopPerformingHEIs()`, `getStats()`
- `resources/js/Components/Admin/TopPerformingHEIs.jsx`
- `resources/js/Pages/Admin/Dashboard.jsx` — passes `stats.topHEIs` and `stats.allHEIs` as props
- `resources/js/Components/Admin/RecentSubmissionsTable.jsx` — reference for navigation pattern (`window.location.href` used there; `router.visit` used here instead — Inertia-native)
- `app/Http/Controllers/Admin/SubmissionController.php` — destination page at `/admin/submissions/{heiId}`
- `routes/web.php` — `admin.submissions.show` route

## Key Discoveries
- `getStats()` wraps the entire payload in a single `Cache::remember("admin_dashboard_stats_{$selectedYear}", ...)`. If the cache was populated before `missingForms` was added, the old payload (without that key) will be served until TTL expires. **Run `php artisan cache:clear` after deploying this change.**
- The modal search already works correctly when `allHEIs` is populated — the "only top 5 in modal" symptom was a stale cache issue, not a logic bug.
- `router.visit()` from `@inertiajs/react` is the correct navigation primitive — not `window.location.href`, which causes a full page reload and breaks Inertia state.
- `missingForms` is intentionally a count only — the full per-form breakdown is on the submissions detail page, which is the canonical place for that data. Duplicating form names here would violate SSOT.

## Decisions Made
- Navigation destination is `/admin/submissions/{hei.id}` — existing route, existing page, no new routes or pages.
- Missing forms badge is count-only on the card. Clicking navigates to the detail page for the full breakdown.
- `missingForms` derived server-side from `FormConfigService` loop — never computed or listed on the frontend to stay consistent with backend SSOT.

## To Be Fixed Soon
- `RecentSubmissionsTable.jsx` still uses `window.location.href` for navigation instead of `router.visit()`. Should be migrated for consistency.
