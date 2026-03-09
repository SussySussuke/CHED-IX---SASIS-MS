# SummaryView — Backend Architecture Refactor

## Context
`SummaryViewController` was a ~1,000-line fat controller handling all keyword matching, category aggregation, override resolution, evidence filtering, and PATCH logic inline — violating the README's "controllers are thin, logic lives in Services" rule. This session extracted all business logic into a proper service layer.

---

## Input
- `SummaryViewController.php` — original monolithic controller (now replaced)
- `routes/web.php` — evidence routes used `{heiId}` (raw integer), no route model binding
- No `app/Http/Requests/` directory existed
- Keyword maps were `private const` inside the controller, inaccessible from outside

## Process
1. Created `app/Services/Summary/` directory.
2. Extracted all keyword maps into a single shared class (`CategoryKeywordMatcher`).
3. Created one service per feature domain, each owning: available years, row aggregation, evidence drilldown, category override, and `validCategories()`.
4. Grouped all 9 read-only sections (no keyword matching, no overrides) into a single `StaticSectionSummaryService` to avoid 9 trivial files.
5. Created `app/Http/Requests/Summary/EvidenceRequest` for the shared `year` query-param validation.
6. Rewrote `SummaryViewController` to ~220 lines of pure HTTP dispatch — no business logic, no keyword maps, no inline validation.
7. Updated `routes/web.php`: all `{heiId}` evidence route params renamed to `{hei}` for Laravel route model binding. Manual `HEI::find()` + 404 handling in each method is now gone.

## Output
New files created:

| File | Role |
|------|------|
| `app/Services/Summary/CategoryKeywordMatcher.php` | All 5 keyword maps + `match*()` methods — single source of truth |
| `app/Services/Summary/ProfileSummaryService.php` | Profile rows + available years; `fullFields` bool handles Inertia vs JSON diff |
| `app/Services/Summary/PersonnelSummaryService.php` | MER2 personnel aggregation, evidence, override |
| `app/Services/Summary/InfoOrientationSummaryService.php` | Annex A+B combined aggregation, evidence, override |
| `app/Services/Summary/GuidanceCounsellingSummaryService.php` | Annex B aggregation, evidence, override |
| `app/Services/Summary/CareerJobSummaryService.php` | Annex C aggregation, evidence, override |
| `app/Services/Summary/HealthSummaryService.php` | Annex J aggregation, evidence, override |
| `app/Services/Summary/StaticSectionSummaryService.php` | Admission, Discipline, Social Community, Student Org, Culture, Scholarship, Safety, Dorm, Special Needs — read-only, no overrides |
| `app/Http/Requests/Summary/EvidenceRequest.php` | Validates `year` query param; exposes `selectedYear()` accessor |
| `app/Http/Controllers/Admin/SummaryViewController.php` | Replaced — now thin dispatch only |

Modified:
- `routes/web.php` — 10 evidence routes: `{heiId}` → `{hei}` (route model binding)

---

## Relevant Files

| File | Role |
|------|------|
| `app/Services/Summary/CategoryKeywordMatcher.php` | Keyword maps — edit here to change category matching logic |
| `app/Services/Summary/StaticSectionSummaryService.php` | Also owns `get*AvailableYears()` for all 9 static sections |
| `app/Http/Controllers/Admin/SummaryViewController.php` | Controller — should stay thin; no logic goes back here |
| `routes/web.php` | Evidence routes use `{hei}` model binding now |

---

## Key Discoveries

- `index()` and `getProfileData()` previously duplicated the same `Summary` + `HEI` query. Unified via `ProfileSummaryService::getRows($year, fullFields: bool)`.
- `StaticSectionSummaryService` also needed `get*AvailableYears()` methods per section — controller calls these to resolve the default year before calling `get*Rows()`.
- Route model binding on `{hei}` requires the route param name to match the type-hinted variable name exactly (`HEI $hei` in method signature). Laravel resolves by the model's primary key automatically.
- `EvidenceRequest` validates only `year` — category validation stays in the controller (`in_array` against `validCategories()`) because each section has a different valid set, making a shared FormRequest impractical for category.
- Laravel's service container auto-resolves constructor-injected services via type-hints — no manual binding needed in a service provider for these classes.

---

## Decisions Made

- **One `StaticSectionSummaryService` for all 9 read-only sections** rather than 9 separate files. They share no logic with each other; grouping avoids file proliferation for trivial read-only aggregations.
- **`CategoryKeywordMatcher` as a plain class with public constants** rather than a PHP 8.1 backed Enum. Keyword maps are `string[] arrays`, not discrete named values — Enum doesn't fit. Constants allow direct `array_keys()` iteration in `validCategories()`.
- **Category override PATCH validation stays inline in the controller** using `implode(',', array_keys(...))` against the matcher constants. Per README: FormRequests are for input shape validation; this is a dynamic in-list check that reads from the keyword map — acceptable to keep in the controller.
- **`fullFields: true` named argument** used in `index()` to get extra profile fields for the Inertia page, `false` (default) for the JSON comparison endpoint. Avoids a second query method.

---

## Attempted Solutions / Dead Ends

- None. Structure was clear from the README rules before writing any code.

---

## To Be Fixed Soon

_(None unresolved.)_
