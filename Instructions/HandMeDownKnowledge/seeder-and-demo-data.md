# Seeder & Demo Data — CHED HEI System

## Input

- `database/seeders/DatabaseSeeder.php` — entry point, calls `DemoDataSeeder`
- `database/seeders/DemoDataSeeder.php` — creates 5 HEIs, 8 user accounts, full and partial annex/MER data across 3 AYs

## Process

`DatabaseSeeder::run()` creates 2 admin-level users then delegates to `DemoDataSeeder`.

`DemoDataSeeder::run()` calls `createHeiAndUsers()` then loops over `YEARS = ['2024-2025', '2025-2026', '2026-2027']`, calling `seedYear($hei, $ay)` for HEI #1. HEIs #2–#5 are seeded inside `createHeiAndUsers()` before it returns.

`seedYear()` calls all annex and MER seeders in order: Summary → Annex A through O (including C1, I1, L1, N1 variants) → MER1 through MER4A.

Partial HEIs use dedicated entry points (`seedYearPartialHeavy`, `seedYearPartialMid`, `seedYearPartialLight`) that selectively call the same seeders with certain annexes/MERs omitted.

All records inserted via `DB::table()->insert()` with `status = 'submitted'`. Timestamps hardcoded to `now()`. Faker locale is `en_PH`.

## Output

### User Accounts (all password: `password123`)

| Email | Name | Role | HEI |
|---|---|---|---|
| superadmin@ched.gov.ph | Super Admin | superadmin | — |
| rai.admin@ched.gov.ph | Rai Admin | admin | — |
| admin@ched.gov.ph | CHED Region Admin | admin | — |
| hei@demostateuniversity.edu.ph | Demo HEI Administrator | hei | Demo State University |
| hei@lakeviewcollege.edu.ph | LCT HEI Administrator | hei | Lakeview College of Technology |
| hei@mindanaotech.edu.ph | MTI HEI Administrator | hei | Mindanao Tech Institute |
| hei@visayaschristian.edu.ph | VCC HEI Administrator | hei | Visayas Christian College |
| hei@cordilleraarts.edu.ph | CAC HEI Administrator | hei | Cordillera Arts College |

### HEI Records

| UII | Name | Type | Code |
|---|---|---|---|
| DEMO01 | Demo State University | SUC | HEI-DEMO |
| DEMO02 | Lakeview College of Technology | Private | HEI-LCT |
| DEMO03 | Mindanao Tech Institute | SUC | HEI-MTI |
| DEMO04 | Visayas Christian College | Private | HEI-VCC |
| DEMO05 | Cordillera Arts College | Private | HEI-CAC |

### Data Seeded Per HEI

| HEI | 2024-2025 | 2025-2026 | 2026-2027 | Completion |
|---|---|---|---|---|
| Demo State University (DEMO01) | ✅ Full | ✅ Full | ✅ Full | 100% |
| Lakeview College of Technology (DEMO02) | ✅ Full | ✅ Full | ✅ Full | 100% |
| Mindanao Tech Institute (DEMO03) | ✅ Partial | ✅ Partial | ✅ Partial | ~70% |
| Visayas Christian College (DEMO04) | ✅ Partial | ✅ Partial | ✅ Partial | ~40% |
| Cordillera Arts College (DEMO05) | ✅ Partial | ✅ Partial | ✅ Partial | ~20% |

### Partial HEI Annex/MER Coverage

| | DEMO03 (~70%) | DEMO04 (~40%) | DEMO05 (~20%) |
|---|---|---|---|
| Summary | ✅ | ✅ | ✅ |
| Annex A | ✅ | ✅ | ✅ |
| Annex B | ✅ | ✅ | ❌ |
| Annex C | ✅ | ❌ | ❌ |
| Annex C1 | ❌ | ❌ | ❌ |
| Annex D | ❌ | ❌ | ✅ |
| Annex E | ✅ | ✅ | ❌ |
| Annex F | ✅ | ❌ | ❌ |
| Annex G | ✅ | ✅ | ❌ |
| Annex H | ✅ | ❌ | ❌ |
| Annex I | ✅ | ❌ | ❌ |
| Annex I1 | ❌ | ❌ | ❌ |
| Annex J | ✅ | ✅ | ❌ |
| Annex K | ✅ | ❌ | ❌ |
| Annex L | ✅ | ❌ | ❌ |
| Annex L1 | ❌ | ❌ | ❌ |
| Annex M | ✅ | ❌ | ❌ |
| Annex N | ✅ | ❌ | ❌ |
| Annex N1 | ❌ | ❌ | ❌ |
| Annex O | ✅ | ❌ | ❌ |
| MER1 | ✅ | ✅ | ❌ |
| MER2 | ✅ | ❌ | ❌ |
| MER3 | ✅ | ❌ | ❌ |
| MER4A | ❌ | ❌ | ❌ |

### Annex Coverage (Full HEIs)

All annexes seeded with `status = 'submitted'`. Each follows the batch → child records pattern (UUID `batch_id`).

| Annex | Table(s) | Notes |
|---|---|---|
| Summary | `summary` | Single row per HEI/year. Population totals vary per AY. |
| A | `annex_a_batches`, `annex_a_programs` | 6–9 programs/year |
| B | `annex_b_batches`, `annex_b_programs` | 4–6 programs/year |
| C | `annex_c_batches`, `annex_c_programs` | 5–7 programs/year |
| C1 | `annex_c1_batches`, `annex_c1_programs` | 3–6 programs/year |
| D | `annex_d_submissions` | Single-row; no child table |
| E | `annex_e_batches`, `annex_e_organizations` | 6–9 orgs/year |
| F | `annex_f_batches`, `annex_f_activities` | 4–6 activities/year |
| G | `annex_g_submissions`, `annex_g_editorial_boards`, `annex_g_other_publications`, `annex_g_programs` | 6 board positions, 1–3 other pubs, 1–3 programs |
| H | `annex_h_batches`, `annex_h_admission_services`, `annex_h_admission_statistics` | 5 services, 5 programs |
| I | `annex_i_batches`, `annex_i_scholarships` | 7 scholarships |
| I1 | `annex_i1_batches`, `annex_i1_food_services` | 4 services |
| J | `annex_j_batches`, `annex_j_programs` | 5–8 programs/year |
| K | `annex_k_batches`, `annex_k_committees` | 4 committees |
| L | `annex_l_batches`, `annex_l_housings` | 3 housings |
| L1 | `annex_l1_batches`, `annex_l1_international_services` | 4 services |
| M | `annex_m_batches`, `annex_m_statistics`, `annex_m_services` | 6–7 stats, 5 services |
| N | `annex_n_batches`, `annex_n_activities` | 4–7 activities/year |
| N1 | `annex_n1_batches`, `annex_n1_sports_programs` | 3–6 programs/year |
| O | `annex_o_batches`, `annex_o_programs` | 4–8 programs/year |

### MER Coverage (Full HEIs)

| MER | Tables | Child Records |
|---|---|---|
| MER1 | `mer1_submissions`, `mer1_educational_attainments`, `mer1_trainings` | 3 degrees, 3–5 trainings/year |
| MER2 | `mer2_submissions`, `mer2_personnel` | 12 personnel (mix of permanent/contractual/JO, 4 office types) |
| MER3 | `mer3_submissions`, `mer3_school_fees` | 9 fee entries/year; amounts scaled +5%/+10% for 2025-2026/2026-2027 |
| MER4A | `mer4a_submissions`, `mer4a_sas_management_items`, `mer4a_guidance_counseling_items` | 10 SAS items + 9 GC items/year |

## Relevant Files

| File | Role |
|---|---|
| `database/seeders/DatabaseSeeder.php` | Entry point — creates superadmin + rai.admin, calls DemoDataSeeder |
| `database/seeders/DemoDataSeeder.php` | All HEI, user, annex, and MER demo data |
| `app/Models/User.php` | `account_type` enum: `superadmin`, `admin`, `hei` |
| `app/Models/HEI.php` | `uii`, `name`, `type`, `code`, `is_active` |

## CHEDRemark Schema Note

`ched_remarks.is_best_practice` (boolean, default false) no longer exists. It was replaced by `remark_text` (nullable string) via migration `2026_03_29_000001`. No demo `ched_remarks` rows are seeded — this table is admin-generated only. Any future seeding of `ched_remarks` rows must use `remark_text` (a string such as `'Compliant'`) instead of `is_best_practice` (boolean).

---

## Key Discoveries

- All annex seeder methods now handle 3 AY keys (`2024-2025`, `2025-2026`, `2026-2027`). Any unmatched AY falls back to `2025-2026` data silently.
- All seeded annexes/MERs have `status = 'submitted'` — they appear in admin review queues immediately after seeding.
- Faker is used only for names in `MER2Personnel` and random participant counts. All other data is hardcoded for realism/repeatability.
- AY dates are bounded per year via `AY_DATES` — faker date generation stays within the academic year range.
- HEIs #2–#5 are seeded inside `createHeiAndUsers()` before it returns HEI #1. Refactoring this method will affect seeding order.
- Partial HEI coverage is controlled solely by which seeder methods `seedYearPartialX` calls — the data shape is identical to full HEIs.
- `seedAnnexJ()` originally inserted a single `number_of_participants` total. After the schema fix (see `annex-j-participant-split.md`), it now inserts `participants_online` + `participants_face_to_face` using a fixed 30/70 split from the original total values.

## Decisions Made

- `rai.admin@ched.gov.ph` (role: `admin`) is in `DatabaseSeeder`, not `DemoDataSeeder` — always created regardless of demo data.
- Password for all accounts is `password123` (Hash::make at seed time).
- `2024-2025` added to `YEARS` and `AY_DATES` constants.
- `annual_submission_deadline` is seeded in `DatabaseSeeder` via `Setting::set()` with default value `2025-12-31 23:59:59`. Placed before `DemoDataSeeder` call so the setting exists before any HEI data is created.
- Partial HEI design intent:
  - DEMO03 (~70%): missing Annex C1, D, I1, L1, N1, MER4A
  - DEMO04 (~40%): only Summary, Annex A, B, E, G, J, MER1
  - DEMO05 (~20%): only Summary, Annex A, D — no MERs
