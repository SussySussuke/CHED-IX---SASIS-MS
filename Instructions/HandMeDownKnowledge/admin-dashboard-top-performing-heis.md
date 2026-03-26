# Admin Dashboard — Top Performing HEIs

## Input
- `TopPerformingHEIs.jsx` showed top 5 HEIs in the widget and all HEIs in a searchable modal.
- Cards were not clickable — no navigation to the HEI's submission detail page.
- No indication of how many forms an HEI was missing.
- `DashboardService::getTopPerformingHEIs()` loop used `foreach ($allForms as $config)` — discarding the `$code` key.
- `missingForms` count was not in the payload at all.
- No per-form breakdown was available anywhere in the dashboard — only a count of missing forms.
- `selectedYear` was not passed into `TopPerformingHEIs.jsx` despite being a page-level Inertia prop.

## Process

### Session 1 — Clickable cards + missing badge
1. Added `missingForms` counter to the existing per-HEI loop in `getTopPerformingHEIs()` — increments on `else` and on `catch`. Zero extra DB queries; derived from the same loop already running.
2. Fixed loop signature to `foreach ($allForms as $code => $config)` for consistency with sibling methods.
3. `missingForms` is now included in both `topHEIs` and `allHEIs` payloads (same method, hits both).
4. In `TopPerformingHEIs.jsx`, added `router.visit()` from `@inertiajs/react` on card click — navigates to `/admin/submissions/{hei.id}`.
5. Added `cursor-pointer` and `hover:border-blue-300` to card for visual affordance.
6. Added a red `{n} missing` badge inside the progress row — only renders when `missingForms > 0`.

### Session 2 — Per-form breakdown panel + split-modal
1. Added `DashboardService::getHeiFormBreakdown(int $heiId, string $academicYear): array` — iterates `FormConfigService::getPriorityOrder()`, runs one `DB::table()->exists()` per form, returns ordered list of `{code, name, completed}`. Logic lives in the Service layer per project rules.
2. Added `SubmissionController::formBreakdown(Request $request, int $heiId)` — thin HTTP wrapper; `DashboardService` constructor-injected. Returns JSON `{hei, year, breakdown}`.
3. Added route `GET /admin/submissions/{heiId}/form-breakdown` named `admin.submissions.form-breakdown` inside the existing `role:admin` middleware group.
4. Rewrote `TopPerformingHEIs.jsx` into sub-components: `BreakdownSkeleton`, `FormRow`, `BreakdownPanel`, `MiniModal`, `HEICard`.
5. Widget card click now opens a `MiniModal` (overlay + Escape key to close) showing the breakdown panel instead of navigating away.
6. "View All HEIs" modal card click expands the modal to the right via CSS `max-width` + `width` + `opacity` transitions — no animation library. A `requestAnimationFrame` delay is required between setting `activeHei` state and flipping `panelVisible` so the browser paints `width: 0` before the transition starts.
7. Vertical divider between panes uses `scaleY` + `opacity` transition tied to `panelVisible`.
8. `BreakdownPanel` uses `fetch` with `AbortController` — aborts on unmount or HEI change to prevent stale responses. UI renders skeleton immediately; data fills in when fetch resolves.
9. Passed `selectedYear` prop from `Dashboard.jsx` into `TopPerformingHEIs.jsx` — previously missing.

## Output
- `app/Services/DashboardService.php` — `missingForms` added to payload, loop key fixed, `getHeiFormBreakdown()` added
- `app/Http/Controllers/Admin/SubmissionController.php` — `DashboardService` injected, `formBreakdown()` method added
- `routes/web.php` — `admin.submissions.form-breakdown` route added
- `resources/js/Components/Admin/TopPerformingHEIs.jsx` — full rewrite with breakdown panel, split-modal, mini-modal, shimmer skeleton
- `resources/js/Pages/Admin/Dashboard.jsx` — `selectedYear` prop wired to `TopPerformingHEIs`

## Relevant Files
- `app/Services/DashboardService.php` — `getTopPerformingHEIs()`, `getStats()`, `getHeiFormBreakdown()`
- `app/Services/FormConfigService.php` — `getAllFormTypes()`, `getPriorityOrder()` — source of form list and order
- `app/Http/Controllers/Admin/SubmissionController.php` — `formBreakdown()`, `show()`
- `routes/web.php` — `admin.submissions.form-breakdown`, `admin.submissions.show`
- `resources/js/Components/Admin/TopPerformingHEIs.jsx`
- `resources/js/Pages/Admin/Dashboard.jsx` — passes `stats.topHEIs`, `stats.allHEIs`, `selectedYear`

## Key Discoveries
- `getStats()` wraps the entire payload in `Cache::remember("admin_dashboard_stats_{$selectedYear}", ...)`. Run `php artisan cache:clear` after any `DashboardService` change or the old cached payload will be served until TTL expires.
- `router.visit()` from `@inertiajs/react` is the correct navigation primitive — `window.location.href` causes a full page reload and breaks Inertia state.
- `missingForms` is intentionally count-only in the payload — per-form breakdown is fetched on demand via the new endpoint, not pre-loaded for all HEIs. Loading it upfront for all HEIs in `allHEIs` would be wasteful.
- The `formBreakdown` endpoint bypasses the dashboard cache entirely — it queries live data directly. This is correct: it's an on-demand detail fetch, not a dashboard aggregate.
- CSS `max-width` transition on the split-modal container does not require JS measurement. The browser handles the interpolation between fixed `rem` values natively.
- `requestAnimationFrame` is required before setting `panelVisible = true`. Without it, React batches the state updates and the browser never renders the initial `width: 0` state, so no transition occurs — the panel just appears instantly.
- Clicking the same HEI card twice collapses the panel (toggle behavior) — `setActiveHei(prev => prev?.id === hei.id ? null : hei)`.

## Decisions Made
- Per-form breakdown fetched via a dedicated JSON endpoint, not pre-loaded into `allHEIs` payload — avoids N×25 data bloat for all HEIs on every dashboard load.
- New route added to `SubmissionController` (not a new controller) — consistent with project rule "one resourceful controller per resource, query params drive variation."
- `getHeiFormBreakdown()` placed in `DashboardService` (not `FormConfigService`) — it's a dashboard concern, not a form config concern.
- No animation library added — CSS transitions on `max-width`, `width`, and `opacity` are sufficient and hardware-accelerated.
- Form rows in breakdown click to `/admin/submissions/{heiId}?year={year}` — the submissions show page does not yet filter by year from the URL, so the year param is passed but not consumed. Left as-is; the show page sorts by year descending so the relevant year is visible at top.

## To Be Fixed Soon
- `RecentSubmissionsTable.jsx` still uses `window.location.href` for navigation instead of `router.visit()`. Should be migrated for consistency.
- `Admin/Submissions/Show` does not consume the `?year` query param to pre-filter or scroll to the selected year. The URL carries the year but the page ignores it.
