# Seeder & Demo Data — CHED HEI System

## Input

- `database/seeders/DatabaseSeeder.php` — entry point, calls `DemoDataSeeder`
- `database/seeders/DemoDataSeeder.php` — creates 2 HEIs, 4 user accounts, and full annex/MER data

## Process

`DatabaseSeeder::run()` creates 2 admin-level users then delegates to `DemoDataSeeder`.

`DemoDataSeeder::run()` calls `createHeiAndUsers()` then loops over `YEARS = ['2025-2026', '2026-2027']`, calling `seedYear($hei, $ay)` for HEI #1. HEI #2 only gets `seedYear` for `2025-2026`.

`seedYear()` calls all annex and MER seeders in order: Summary → Annex A through O (including C1, I1, L1, N1 variants) → MER1 through MER4A.

All records are inserted via `DB::table()->insert()` with `status = 'submitted'`. Timestamps hardcoded to `now()`. Faker locale is `en_PH`.

## Output

### User Accounts (all password: `password123`)

| Email | Name | Role | HEI |
|---|---|---|---|
| superadmin@ched.gov.ph | Super Admin | superadmin | — |
| rai.admin@ched.gov.ph | Rai Admin | admin | — |
| admin@ched.gov.ph | CHED Region Admin | admin | — |
| hei@demostateuniversity.edu.ph | Demo HEI Administrator | hei | Demo State University |
| hei@lakeviewcollege.edu.ph | LCT HEI Administrator | hei | Lakeview College of Technology |

### HEI Records

| UII | Name | Type | Code |
|---|---|---|---|
| DEMO01 | Demo State University | SUC | HEI-DEMO |
| DEMO02 | Lakeview College of Technology | Private | HEI-LCT |

### Data Seeded Per HEI

**Demo State University (DEMO01):** Full data for both `2025-2026` and `2026-2027`.

**Lakeview College of Technology (DEMO02):** Full data for `2025-2026` only.

### Annex Coverage

All annexes seeded with `status = 'submitted'`. Each follows the batch → child records pattern (UUID `batch_id`).

| Annex | Table(s) | Child Records | Notes |
|---|---|---|---|
| Summary | `summary` | — | Single row per HEI/year. Population totals, website links, social media JSON. |
| A | `annex_a_batches`, `annex_a_programs` | 8–9 programs/year | Co-curricular activities |
| B | `annex_b_batches`, `annex_b_programs` | 5–6 programs/year | GAD programs |
| C | `annex_c_batches`, `annex_c_programs` | 6–7 programs/year | Career development |
| C1 | `annex_c1_batches`, `annex_c1_programs` | 5–6 programs/year | Guidance & counseling |
| D | `annex_d_submissions` | — | Student handbook single-row (no child table) |
| E | `annex_e_batches`, `annex_e_organizations` | 7–9 orgs/year | Recognized student orgs |
| F | `annex_f_batches`, `annex_f_activities` | 5–6 activities/year | Student discipline |
| G | `annex_g_submissions`, `annex_g_editorial_boards`, `annex_g_other_publications`, `annex_g_programs` | 8 board positions, 2–3 other pubs, 2–3 programs | Student publication |
| H | `annex_h_batches`, `annex_h_admission_services`, `annex_h_admission_statistics` | 7 services, 8 programs | Admissions |
| I | `annex_i_batches`, `annex_i_scholarships` | 9 scholarships | Scholarship programs |
| I1 | `annex_i1_batches`, `annex_i1_food_services` | 6 services | Food services |
| J | `annex_j_batches`, `annex_j_programs` | 7–8 programs/year | Health services |
| K | `annex_k_batches`, `annex_k_committees` | 5 committees | Student welfare committees |
| L | `annex_l_batches`, `annex_l_housings` | 4 housings | Dormitory/housing |
| L1 | `annex_l1_batches`, `annex_l1_international_services` | 4–5 services/year | International students |
| M | `annex_m_batches`, `annex_m_statistics`, `annex_m_services` | 6–7 stats, 7 services | Health & wellness stats |
| N | `annex_n_batches`, `annex_n_activities` | 6–7 activities/year | Sports & recreation |
| N1 | `annex_n1_batches`, `annex_n1_sports_programs` | 5–6 programs/year | Varsity sports |
| O | `annex_o_batches`, `annex_o_programs` | 7–8 programs/year | Community extension |

### MER Coverage

MER forms use integer `id` as FK (not UUID). All seeded with `status = 'submitted'`.

| MER | Tables | Child Records |
|---|---|---|
| MER1 | `mer1_submissions`, `mer1_educational_attainments`, `mer1_trainings` | 3–4 degrees, 4–5 trainings/year |
| MER2 | `mer2_submissions`, `mer2_personnel` | 13 personnel (mix of permanent/contractual/JO, 4 office types) |
| MER3 | `mer3_submissions`, `mer3_school_fees` | 9 fee entries/year |
| MER4A | `mer4a_submissions`, `mer4a_sas_management_items`, `mer4a_guidance_counseling_items` | 10 SAS items + 9 GC items/year |

## Relevant Files

| File | Role |
|---|---|
| `database/seeders/DatabaseSeeder.php` | Entry point — creates superadmin + rai.admin, calls DemoDataSeeder |
| `database/seeders/DemoDataSeeder.php` | All HEI, user, annex, and MER demo data |
| `app/Models/User.php` | `account_type` enum: `superadmin`, `admin`, `hei` |
| `app/Models/HEI.php` | `uii`, `name`, `type`, `code`, `is_active` |

## Key Discoveries

- `DemoDataSeeder` was a previously undocumented sub-seeder. `schema-analysis.md` originally claimed only one account was created — this was wrong.
- All seeded annexes/MERs have `status = 'submitted'` — they will appear in admin review queues immediately after seeding.
- Faker is used only for names in `MER2Personnel` and UUIDs. All other data is hardcoded for realism/repeatability.
- AY dates are bounded per year via `AY_DATES` constant — faker date generation stays within the academic year range.
- `DemoDataSeeder` also seeds HEI #2 (Lakeview College) for `2025-2026` only, mid-execution inside `createHeiAndUsers()` before returning HEI #1. This is a side-effect of a single method — worth noting if you ever refactor.

## Decisions Made

- `rai.admin@ched.gov.ph` (role: `admin`) was added to `DatabaseSeeder` directly, not in `DemoDataSeeder`, so it is always created regardless of demo data toggle.
- Password for all accounts is `password123` (Hash::make at seed time).
