# Summary View — Profile Section Blank on Year Change

## Input
Admin Summary Reports page (`/admin/summary`). Section = Profile, Academic Year = single tag (e.g. 2026-2027). All data columns (Org Chart, HEI Website, SAS Website, Social Media, Student Handbook, Student Publication, Submitted At) showed dashes/blank on year change, but displayed correctly on initial page load.

## Process
Two code paths serve the same data:
1. `SummaryViewController::index()` — Inertia page load, calls `ProfileSummaryService::getRows($year, fullFields: true)`
2. `SummaryViewController::getProfileData()` — JSON fetch on year change from `YearMultiSelect`, calls `getRows($year)` with `fullFields` defaulting to `false`

`ProfileSummaryService::getRows()` only appends the display fields (`hei_website`, `sas_website`, `submitted_org_chart`, etc.) when `fullFields = true`. With `false`, only base fields (`hei_id`, `hei_code`, `hei_name`, `hei_type`, `status`, population fields) are returned. The AG Grid column defs reference the missing fields → renders dashes.

## Root Cause
`getProfileData()` omitted `fullFields: true`. Initial page load masked the bug because `index()` always passed it correctly.

## Output
One-line fix in `SummaryViewController::getProfileData()`: `getRows($selectedYear)` → `getRows($selectedYear, fullFields: true)`.

## Relevant Files
- `app/Http/Controllers/Admin/SummaryViewController.php` — `getProfileData()` method
- `app/Services/Summary/ProfileSummaryService.php` — `getRows()` with `fullFields` flag
- `resources/js/Pages/Admin/SummaryView.jsx` — fetch logic in `fetchAllSelectedYears()`
- `resources/js/Config/summaryView/profileConfig.jsx` — column defs referencing the missing fields

## Key Discoveries
- The `fullFields` flag exists to serve two consumers: the Inertia SSR payload (needs all fields) and the comparison fetch (originally designed minimal). Profile section needs full fields in both cases.
- Bug only surfaced on year interaction, not on load — single-year setups made it appear like a "no data" issue rather than a field-shape mismatch.

## Decisions Made
- Both `index()` and `getProfileData()` now pass `fullFields: true`. The minimal-fields path for Profile is currently unused and can be removed in a future cleanup if the comparison feature never needs a stripped payload.
