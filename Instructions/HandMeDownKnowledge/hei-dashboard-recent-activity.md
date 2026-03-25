# HEI Dashboard — Recent Activity

## Input
- `RecentActivity.jsx` had a hardcoded `defaultActivities` array (3 fake entries: "Annex B Published", "Annex F Submitted", "Annex A Published").
- If the backend returned an empty array, the component silently rendered the fake data instead of an empty state — deceptive UX.
- `DashboardController::getRecentActivities()` pre-queried `DB::table('summary')` before the `getAllFormTypes()` loop, which already includes SUMMARY — causing Summary records to be counted and returned twice.

## Process
1. Removed `defaultActivities` array and the ternary fallback from `RecentActivity.jsx`.
2. `activityList` now directly uses the `activities` prop — empty array triggers the existing empty state branch.
3. Replaced the inline empty state paragraph with `EmptyState` component (clock icon, honest copy).
4. In `DashboardController`, initialized `$summaryActivities` as `collect()` instead of a pre-query — the loop accumulates all forms including SUMMARY without duplication.

## Output
- `resources/js/Components/HEI/RecentActivity.jsx` — fake fallback removed, EmptyState wired in
- `app/Http/Controllers/HEI/DashboardController.php` — Summary double-count fixed in `getRecentActivities()`

## Relevant Files
- `resources/js/Components/HEI/RecentActivity.jsx`
- `resources/js/Components/Common/EmptyState.jsx` — used for the empty state
- `app/Http/Controllers/HEI/DashboardController.php`
- `app/Services/FormConfigService.php` — `getAllFormTypes()` already includes SUMMARY; do not pre-query the summary table separately

## Key Discoveries
- `getAllFormTypes()` returns SUMMARY as the first entry — any code that manually queries `summary` before or outside that loop will double-count it.
- The correct pattern for empty states in this project is `EmptyState` from `Components/Common/` — do not inline paragraph fallbacks.

## Decisions Made
- No `defaultActivities` fallback of any kind — if the HEI has no submissions, show the empty state honestly.
- The `const activityList = activities` line was kept (not inlined) to avoid touching the render loop — smallest correct change.
