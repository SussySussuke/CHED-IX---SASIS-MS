# Annex J — Participant Split (Online vs Face-to-Face)

## Input

- `annex_j_programs` table had a single `number_of_participants` column storing a summed total
- `AnnexJController::store()` was receiving `participants_online` and `participants_face_to_face` from the frontend and the Excel parser, but summing them into the single column before insert
- Frontend config (`form3Annexes.js` Annex J), `AnnexJParser.php`, and the grid `dataMapper` already expected the two split columns — they were correct and waiting

## Process

1. Created migration `2026_03_25_000001_update_annex_j_programs_split_participants.php` — adds `participants_online` and `participants_face_to_face` (both `unsignedInteger`, default 0), then drops `number_of_participants`
2. Updated `AnnexJProgram::$fillable` — removed old column, added two new ones
3. Fixed `AnnexJController::store()` — saves each column separately instead of summing
4. Updated `DemoDataSeeder::seedAnnexJ()` — seeds split values (30% online / 70% face-to-face approximation from original total)

## Output

- `annex_j_programs` now stores `participants_online` and `participants_face_to_face` independently
- The grid correctly persists and reloads both columns
- The Excel parser (`AnnexJParser`) and the frontend config required no changes

## Relevant Files

- `database/migrations/2026_03_25_000001_update_annex_j_programs_split_participants.php`
- `app/Models/AnnexJProgram.php`
- `app/Http/Controllers/HEI/AnnexJController.php`
- `database/seeders/DemoDataSeeder.php` — `seedAnnexJ()` method
- `resources/js/Config/annexConfigs/form3Annexes.js` — Annex J config (no changes needed)
- `app/Services/Excel/Parsers/AnnexJParser.php` — (no changes needed)

## Key Discoveries

- The mismatch originated in the base migration (`0001_01_01_000000_create_base_tables.php`) where Annex J was given a single `number_of_participants` column — unlike Annex A, B, C, etc. which all had `participants_online` + `participants_face_to_face` from the start
- The controller was silently discarding the split by adding the values together before insert. No validation error was raised because the request fields were correct; only the persistence was wrong
- All frontend and parser code was already aligned to the two-column schema — the bug was entirely backend/DB

## Decisions Made

- Existing rows in `annex_j_programs` prior to migration cannot have their split recovered (data was stored as a total). Both columns default to 0 for old rows
- Demo seeder uses a fixed 30/70 online/f2f split as a reasonable approximation; exact values are not critical for demo purposes
