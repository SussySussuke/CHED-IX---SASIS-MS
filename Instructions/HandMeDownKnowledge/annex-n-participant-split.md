# Annex N — Participant Split (`participants_online` + `participants_face_to_face`)

## Input
Annex N (Culture and the Arts) `participants_online` and `participants_face_to_face` always displayed as 0 in the UI and in Excel exports, despite the HEI entering real values.

## Process
`annex_n_activities` was created in `0001_01_01_000000_create_base_tables.php` with a single `number_of_participants` integer column. The frontend (`form3Annexes.js`) and the Excel parser (`AnnexNParser.php`) had already been written expecting two separate columns — matching the pattern established by Annex J (see `annex-j-participant-split.md`). The controller (`AnnexNController::store()`) summed the two incoming values before saving:

```php
'number_of_participants' => ($activity['participants_online'] ?? 0) + ($activity['participants_face_to_face'] ?? 0),
```

On reload, `dataMapper` in `form3Annexes.js` read `item.participants_online` and `item.participants_face_to_face` — neither exists in the DB — so both always resolved to `|| 0`. Excel export read the same DB columns, so exported values were also 0.

## Output
- `database/migrations/2026_03_31_000002_split_participants_in_annex_n_activities.php` — adds `participants_online` + `participants_face_to_face` (both `unsignedInteger`, default 0), drops `number_of_participants`. Reversible.
- `app/Models/AnnexNActivity.php` — `$fillable` updated: `number_of_participants` removed, two new columns added.
- `app/Http/Controllers/HEI/AnnexNController.php` — `store()` now saves the two columns separately instead of summing them.
- `database/seeders/DemoDataSeeder.php` — `seedAnnexN()` updated to use 30/70 split (matching `seedAnnexJ()` pattern); `number_of_participants` removed from insert.

## Relevant Files
- `database/migrations/0001_01_01_000000_create_base_tables.php` — original `annex_n_activities` schema (now superseded by the new migration)
- `database/migrations/2026_03_31_000002_split_participants_in_annex_n_activities.php` — the fix
- `app/Models/AnnexNActivity.php`
- `app/Http/Controllers/HEI/AnnexNController.php`
- `resources/js/Config/annexConfigs/form3Annexes.js` — `N` config: `dataMapper` and `submitMapper` were already correct; no change needed
- `app/Services/Excel/Parsers/AnnexNParser.php` — was already reading `participants_online` (col 4) and `participants_face_to_face` (col 5) correctly; no change needed
- `database/seeders/DemoDataSeeder.php` — `seedAnnexN()`

## Key Discoveries
- The frontend, Excel parser, and controller validation were all already correct and expected the split columns. Only the DB schema, model, controller insert, and seeder were lagging behind.
- This is an exact repeat of the Annex J situation (`annex-j-participant-split.md`). The base migration created both Annex J and Annex N with the old single-column shape. J was fixed in `2026_03_25_000001`; N was missed.
- Existing seeded rows for `annex_n_activities` will have `participants_online = 0` and `participants_face_to_face = 0` after migration (the old total is unrecoverable — migration comment documents this).
- `migrate:fresh --seed` is required to get realistic split values in demo data.

## Decisions Made
- Same approach as Annex J: add two new columns, drop the old one, default 0 for existing rows.
- Seeder uses fixed 30/70 split (consistent with `seedAnnexJ()`).
- No changes to the frontend or Excel parser — they were already correct.
