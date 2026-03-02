# Schema vs Model Analysis — CHED HEI System
> Inscribed by the Omnissiah's servant. Do not modify without full re-analysis of both migrations and models.

---

## SEEDER

`database/seeders/DatabaseSeeder.php` — single file, no sub-seeders.

Run with: `php artisan migrate:fresh --seed`

Creates exactly ONE account:
- **Name:** Super Admin
- **Email:** superadmin@ched.gov.ph
- **Password:** password123
- **Role:** superadmin
- **is_active:** true

---

## OVERVIEW

This project is a Laravel-based CHED (Commission on Higher Education) submission system. HEIs (Higher Education Institutions) submit various Annexes and MER (Management Evaluation Reports) forms. Each form follows the same **batch/submission → child records** pattern. CHED administrators review, approve, reject, or request changes.

---

## ARCHITECTURE PATTERN

### Two Structural Patterns Exist:

**Pattern A — Annex forms (A through O, plus C1/I1/L1/N1 variants):**
- `annex_X_batches` — the parent/envelope (has UUID `batch_id`, `hei_id`, `academic_year`, `status`, notes)
- `annex_X_[records]` — the child rows (FK to `batch_id` UUID, NOT the integer `id`)
- Models auto-generate UUID on `creating` via boot()

**Pattern B — MER forms (MER1, MER2, MER3, MER4A):**
- `mer#_submissions` — the parent (integer `id` PK, `hei_id`, `academic_year`, `status`, notes)
- `mer#_[records]` — child rows (FK to `mer#_submission_id` integer)
- NO UUID used here — FK is the integer primary key

**Key difference:** Annex batches use UUID as the join key. MER submissions use integer ID as the join key.

---

## STATUS ENUM

All batches/submissions share the same workflow statuses:
```
pending → submitted → [request ↔ submitted] → approved → published
                    ↘ rejected
                    ↘ cancelled
                    ↘ overwritten  (MER only — added via separate migration)
```

**IMPORTANT:** `overwritten` status was added to MER1 via migration `2025_02_02_000002` using a raw `ALTER TABLE` statement (not a Blueprint change). MER2 and MER3 already had `overwritten` in their original migration. **MER4A model uses `scopeNotOverwritten()` implying it also has `overwritten` status, but no migration for MER4A tables exists in the migrations folder — see CRITICAL ISSUES below.**

---

## MIGRATION ↔ MODEL COMPARISON

### HEI (`heis` table)
- **Migration source:** Referenced by all other tables. `established_at` added via `2025_01_24`.
- **Model `HEI.php`:** Correctly maps `uii`, `name`, `type`, `code`, `email`, `phone`, `address`, `established_at`, `is_active`. Casts `is_active` as boolean, `established_at` as date.
- **Relationships in model:** Only `users()` and `annexABatches()` defined. ALL other annex/MER batches are missing relationship methods (AnnexBBatch, AnnexCBatch, etc.). This is probably intentional to keep the model lean, but be aware.
- **Status:** ✅ ALIGNED

---

### AuditLog (`audit_logs` table)
- **Migration:** `user_id`, `user_name`, `user_role` (enum: superadmin/admin), `action`, `entity_type`, `entity_id`, `entity_name`, `description`, `old_values` (json), `new_values` (json), `ip_address`, `user_agent`, `created_at` only (no `updated_at`).
- **Model `AuditLog.php`:** Correctly maps all fields. `UPDATED_AT = null` properly disables updated_at. `old_values` and `new_values` cast as array (JSON). Static `log()` helper method. `getActionColorAttribute` and `getEntityTypeColorAttribute` computed helpers.
- **Status:** ✅ ALIGNED

---

### CHEDContact (`ched_contacts` table)
- **Migration:** `name`, `address`, `phone`, `email`, `order`, `is_active`. Seeds a default CHED Central Office record.
- **Model `CHEDContact.php`:** Maps all fields. Static `getActive()` scope helper.
- **Note:** The migration uses `DB::table()` directly without a `use` import for the DB facade (the `use Illuminate\Support\Facades\DB;` is missing from the migration file). This **will throw an error** when migrating fresh if DB facade is not globally imported. Check `composer.json` aliases.
- **Status:** ⚠️ POTENTIAL BUG — Missing `use Illuminate\Support\Facades\DB;` in migration `2025_01_26_000001_create_ched_contacts_table.php`

---

### AnnexC1 (`annex_c1_batches` / `annex_c1_programs`)
- **Migration:** Batch has UUID `batch_id`, standard fields. Program has `title`, `venue`, `implementation_date`, `target_group`, `participants_online`, `participants_face_to_face`, `organizer`, `remarks`.
- **Model `AnnexC1Batch.php`:** Maps core fillable. Missing `admin_notes` and `cancelled_notes` in `$fillable` — they exist in the migration. Not a data-loss risk (they'll still persist if set directly), but mass-assignment will silently ignore them.
- **Model `AnnexC1Program.php`:** Fully aligned. Casts implementation_date as date, participant counts as integer.
- **Status:** ⚠️ MINOR — `AnnexC1Batch` missing `admin_notes` and `cancelled_notes` in `$fillable`

---

### AnnexI1 (`annex_i1_batches` / `annex_i1_food_services`)
- **Migration:** Batch is standard. Food service has `service_name`, `service_type`, `operator_name`, `location`, `number_of_students_served`, `remarks`.
- **Model `AnnexI1Batch.php`:** Missing `admin_notes` in `$fillable`. Also references `Hei::class` (lowercase H) instead of `HEI::class`. This **will cause a class-not-found error** if the `hei()` relationship is ever called.
- **Model `AnnexI1FoodService.php`:** Aligned. No casts defined (number_of_students_served stays as string from DB unless cast — minor but safe).
- **Status:** ⚠️ BUG — `AnnexI1Batch::hei()` references `Hei::class` (wrong casing). Should be `HEI::class`. Same issue in `AnnexL1Batch` and `AnnexN1Batch`.

---

### AnnexL1 (`annex_l1_batches` / `annex_l1_international_services`)
- **Migration:** Service has `service_name`, `service_type`, `target_nationality`, `number_of_students_served`, `officer_in_charge`, `remarks`.
- **Model `AnnexL1Batch.php`:** Same `Hei::class` casing bug. Missing `admin_notes` in `$fillable`.
- **Model `AnnexL1InternationalService.php`:** Aligned.
- **Status:** ⚠️ BUG — Same `Hei::class` casing issue.

---

### AnnexN1 (`annex_n1_batches` / `annex_n1_sports_programs`)
- **Migration:** Sports program has `program_title`, `sport_type`, `implementation_date`, `venue`, `participants_count`, `organizer`, `remarks`.
- **Model `AnnexN1Batch.php`:** Same `Hei::class` casing bug. Missing `admin_notes` in `$fillable`.
- **Model `AnnexN1SportsProgram.php`:** Aligned. No date cast on `implementation_date` (unlike AnnexC1Program which does cast it — inconsistency across models).
- **Status:** ⚠️ BUG — `Hei::class` casing. ⚠️ INCONSISTENCY — `implementation_date` not cast as date unlike sibling AnnexC1Program.

---

### MER1 (`mer1_submissions` / `mer1_educational_attainments` / `mer1_trainings`)
- **Migration:** Submission has `sas_head_name`, `sas_head_position`, `permanent_status`, `other_achievements`. Has `unique(['hei_id', 'academic_year'])` constraint. `overwritten` status added in second migration.
- **Model `MER1Submission.php`:** `$fillable` includes `hei_name`, `hei_code`, `hei_type`, `hei_address` — THESE COLUMNS DO NOT EXIST IN THE MIGRATION. They will fail on insert/update if actually used. They are likely leftover from a refactor where HEI data was denormalized into the submission, then removed.
- **MER1EducationalAttainment / MER1Training:** Fully aligned.
- **Status:** ⚠️ STALE FILLABLE — `MER1Submission.$fillable` contains `hei_name`, `hei_code`, `hei_type`, `hei_address` which have no migration columns.

---

### MER2 (`mer2_submissions` / `mer2_personnel`)
- **Migration:** Submission has 4 `students_handled` integer columns. Personnel uses discriminator column `office_type` (enum: 4 values). `overwritten` already in original migration.
- **Model `MER2Submission.php`:** Fully aligned. Rich scoped relationship methods per office type. All 4 student count fields correctly cast as integer.
- **Model `MER2Personnel.php`:** Fully aligned. Constants defined for office types. Rich scopes and computed `$isFilled` accessor. No `categoryOverride` relationship defined here (the `PersonnelCategoryOverride` model points back via `belongsTo`, but `MER2Personnel` doesn't have a `hasOne(PersonnelCategoryOverride)` — this is a one-directional relationship, which is acceptable but worth noting).
- **Status:** ✅ ALIGNED

---

### MER3 (`mer3_submissions` / `mer3_school_fees`)
- **Migration:** School fee has `name_of_school_fees`, `description`, `amount` (decimal 15,2), `remarks`. `overwritten` already in original migration.
- **Model `MER3Submission.php`:** Fully aligned.
- **Model `MER3SchoolFee.php`:** `amount` cast as `decimal:2`. Aligned.
- **Status:** ✅ ALIGNED

---

### MER4A (`mer4a_submissions` / `mer4a_sas_management_items` / `mer4a_guidance_counseling_items`)
- **Migration:** **DOES NOT EXIST.** There is no migration file for any of the `mer4a_*` tables.
- **Models:** `MER4ASubmission.php`, `MER4ASASManagementItem.php`, `MER4AGuidanceCounselingItem.php` all exist with proper structure.
- **MER4ASASManagementItem schema (inferred from model):** `mer4a_submission_id`, `row_id`, `requirement`, `evidence_file`, `status_compiled` (boolean), `hei_remarks`.
- **MER4AGuidanceCounselingItem schema (inferred from model):** Same structure as SASManagementItem.
- **Status:** 🔴 CRITICAL — MER4A TABLES HAVE NO MIGRATION. Running `php artisan migrate:fresh` will break everything that uses MER4A. A migration must be created.

---

### Category Overrides

These are admin-only override tables that let CHED manually assign categories to records, bypassing keyword-matching logic.

| Model | Table | FK Points To | Migration Status |
|---|---|---|---|
| `ProgramCategoryOverride` | `program_category_overrides` | `annex_a_programs` or `annex_b_programs` via polymorphic enum | ✅ Exists |
| `PersonnelCategoryOverride` | `personnel_category_overrides` | `mer2_personnel.id` | ✅ Exists |
| `GuidanceCounsellingCategoryOverride` | `guidance_counselling_category_overrides` | `annex_b_programs.id` | ✅ Exists (no FK constraint in migration — soft reference) |
| `CareerJobCategoryOverride` | `career_job_category_overrides` | `annex_c_programs.id` (inferred) | ✅ Exists (no FK constraint — soft reference) |
| `HealthCategoryOverride` | `health_category_overrides` | `annex_j_programs.id` (inferred) | ✅ Exists (no FK constraint — soft reference) |

**Note on `ProgramCategoryOverride`:** Originally had a single `manual_category` (string). Migration `2026_02_18_000002` renamed it to `manual_categories` and converted the column to hold a JSON array. The model correctly casts `manual_categories` as `array`. This migration uses `renameColumn` which requires Doctrine DBAL on older Laravel/MySQL setups — verify your environment supports it.

**Note on category override FK gaps:** `GuidanceCounsellingCategoryOverride`, `CareerJobCategoryOverride`, and `HealthCategoryOverride` migrations do NOT define a foreign key constraint on `program_id`. Orphaned overrides are possible if parent programs are deleted. Only `PersonnelCategoryOverride` has a proper `onDelete('cascade')` FK.

---

### AnnexF (`annex_f_batches`)
- Migration `2026_02_19_000003` adds `student_discipline_committee` (string, nullable) column via ALTER.
- No dedicated AnnexF model file read in this analysis but it references `annex_f_batches` table which must predate the migration files present.
- **Status:** ✅ Column addition is clean.

---

## DUPLICATE MIGRATION FILENAME BUG

```
2026_02_19_000002_create_career_job_category_overrides_table.php
2026_02_19_000002_create_health_category_overrides_table.php
```

**TWO MIGRATIONS SHARE THE SAME TIMESTAMP PREFIX `2026_02_19_000002`.** Laravel's migration runner orders by filename. Both files are named `000002` on the same date. This CAN cause issues on some systems or with certain migration commands depending on filesystem ordering. Laravel may run one before the other unpredictably. **Rename one to `000003` (or higher) and shift the existing `000003` to `000004`.**

Wait — `000003` is already taken by the annex_f alteration. So the numbering is:
- `000001` = guidance_counselling
- `000002` = **DUPLICATE** (career_job AND health — both claim this number)
- `000003` = annex_f student_discipline_committee

**Recommended fix:** Rename health to `000004`, shift annex_f to `000005`, or pick any non-colliding suffix.

---

## MODEL → MIGRATION COVERAGE AUDIT

Complete cross-reference of every model file against its migration. Verified as of the migration set described below.

| Model | Table | Migration File | Status |
|---|---|---|---|
| `HEI` | `heis` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `User` | `users` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `Setting` | `settings` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `Summary` | `summary` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexABatch` | `annex_a_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexAProgram` | `annex_a_programs` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexBBatch` | `annex_b_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexBProgram` | `annex_b_programs` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexCBatch` | `annex_c_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexCProgram` | `annex_c_programs` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexDSubmission` | `annex_d_submissions` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexEBatch` | `annex_e_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexEOrganization` | `annex_e_organizations` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexFBatch` | `annex_f_batches` | `0001_01_01_000000_create_base_tables.php` + `2026_02_19_000005` | ✅ |
| `AnnexFActivity` | `annex_f_activities` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexGSubmission` | `annex_g_submissions` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexGEditorialBoard` | `annex_g_editorial_boards` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexGOtherPublication` | `annex_g_other_publications` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexGProgram` | `annex_g_programs` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexHBatch` | `annex_h_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexHAdmissionService` | `annex_h_admission_services` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexHAdmissionStatistic` | `annex_h_admission_statistics` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexIBatch` | `annex_i_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexIScholarship` | `annex_i_scholarships` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexJBatch` | `annex_j_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexJProgram` | `annex_j_programs` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexKBatch` | `annex_k_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexKCommittee` | `annex_k_committees` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexLBatch` | `annex_l_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexLHousing` | `annex_l_housings` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexMBatch` | `annex_m_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexMStatistic` | `annex_m_statistics` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexMService` | `annex_m_services` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexNBatch` | `annex_n_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexNActivity` | `annex_n_activities` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexOBatch` | `annex_o_batches` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexOProgram` | `annex_o_programs` | `0001_01_01_000000_create_base_tables.php` | ✅ |
| `AnnexC1Batch` | `annex_c1_batches` | `2025_01_28_000001_create_annex_c1_tables.php` | ✅ |
| `AnnexC1Program` | `annex_c1_programs` | `2025_01_28_000001_create_annex_c1_tables.php` | ✅ |
| `AnnexI1Batch` | `annex_i1_batches` | `2025_01_29_000001_create_annex_i1_tables.php` | ✅ |
| `AnnexI1FoodService` | `annex_i1_food_services` | `2025_01_29_000001_create_annex_i1_tables.php` | ✅ |
| `AnnexL1Batch` | `annex_l1_batches` | `2025_01_30_000001_create_annex_l1_tables.php` | ✅ |
| `AnnexL1InternationalService` | `annex_l1_international_services` | `2025_01_30_000001_create_annex_l1_tables.php` | ✅ |
| `AnnexN1Batch` | `annex_n1_batches` | `2025_01_31_000001_create_annex_n1_tables.php` | ✅ |
| `AnnexN1SportsProgram` | `annex_n1_sports_programs` | `2025_01_31_000001_create_annex_n1_tables.php` | ✅ |
| `AuditLog` | `audit_logs` | `2025_01_25_000001_create_audit_logs_table.php` | ✅ |
| `CHEDContact` | `ched_contacts` | `2025_01_26_000001_create_ched_contacts_table.php` | ✅ |
| `CHEDRemark` | `ched_remarks` | `2025_02_06_000001_create_ched_remarks_table.php` | ✅ |
| `MER1Submission` | `mer1_submissions` | `2025_02_02_000001_create_mer1_tables.php` | ✅ |
| `MER1EducationalAttainment` | `mer1_educational_attainments` | `2025_02_02_000001_create_mer1_tables.php` | ✅ |
| `MER1Training` | `mer1_trainings` | `2025_02_02_000001_create_mer1_tables.php` | ✅ |
| `MER2Submission` | `mer2_submissions` | `2025_02_03_000001_create_mer2_tables.php` | ✅ |
| `MER2Personnel` | `mer2_personnel` | `2025_02_03_000001_create_mer2_tables.php` | ✅ |
| `MER3Submission` | `mer3_submissions` | `2025_02_04_000001_create_mer3_tables.php` | ✅ |
| `MER3SchoolFee` | `mer3_school_fees` | `2025_02_04_000001_create_mer3_tables.php` | ✅ |
| `MER4ASubmission` | `mer4a_submissions` | `2025_02_05_000001_create_mer4a_tables.php` | ✅ |
| `MER4ASASManagementItem` | `mer4a_sas_management_items` | `2025_02_05_000001_create_mer4a_tables.php` | ✅ |
| `MER4AGuidanceCounselingItem` | `mer4a_guidance_counseling_items` | `2025_02_05_000001_create_mer4a_tables.php` | ✅ |
| `ProgramCategoryOverride` | `program_category_overrides` | `2026_02_18_000001` + `000002` | ✅ |
| `PersonnelCategoryOverride` | `personnel_category_overrides` | `2026_02_18_000003_create_personnel_category_overrides_table.php` | ✅ |
| `GuidanceCounsellingCategoryOverride` | `guidance_counselling_category_overrides` | `2026_02_19_000001_create_guidance_counselling_category_overrides_table.php` | ✅ |
| `CareerJobCategoryOverride` | `career_job_category_overrides` | `2026_02_19_000002_create_career_job_category_overrides_table.php` | ✅ |
| `HealthCategoryOverride` | `health_category_overrides` | `2026_02_19_000004_create_health_category_overrides_table.php` | ✅ |

**TOTAL: 63 models — ALL COVERED.** Every model has a corresponding migration.

### Known model/migration column mismatches (not blocking, but noteworthy)
- `AnnexJProgram.$fillable` has `number_of_participants` — migration corrected to match (setup.sql had `participants_online`/`participants_face_to_face`, model wins)
- `AnnexNActivity.$fillable` has `number_of_participants` — same correction applied
- `MER1Submission.$fillable` still contains ghost columns (`hei_name`, `hei_code`, `hei_type`, `hei_address`) with no migration columns — these should be removed from the model's `$fillable`
- `AnnexC1Batch`, `AnnexI1Batch`, `AnnexL1Batch`, `AnnexN1Batch` — `admin_notes` missing from `$fillable` but exists in DB
- `AnnexI1Batch`, `AnnexL1Batch`, `AnnexN1Batch`, `AnnexFBatch`, `AnnexGSubmission`, `AnnexHBatch`, several others — reference `Hei::class` (wrong casing) instead of `HEI::class`

---

## MIGRATION FILES CREATED

The following migration files were added to complete the missing history:

| File | What it covers |
|---|---|
| `0001_01_01_000000_create_base_tables.php` | All foundation tables: heis, users, settings, summary, Annex A–O (sourced from setup.sql) |
| `2025_02_05_000001_create_mer4a_tables.php` | MER4A submissions, SAS management items, guidance counseling items |
| `2025_02_06_000001_create_ched_remarks_table.php` | CHED remarks / best practice flags (polymorphic, no hard FKs) |
| `2026_02_19_000004_create_health_category_overrides_table.php` | Health category overrides (renamed from duplicate 000002) |
| `2026_02_19_000005_add_student_discipline_committee_to_annex_f_batches.php` | Annex F column add (renamed from duplicate 000003) |

**⚠️ YOU MUST MANUALLY DELETE these two files before running migrate:**
- `2026_02_19_000002_create_health_category_overrides_table.php` (replaced by 000004)
- `2026_02_19_000003_add_student_discipline_committee_to_annex_f_batches.php` (replaced by 000005)

They have been overwritten with warnings but Laravel will still try to parse them.

---

## SUMMARY OF ISSUES

| Severity | Location | Issue |
|---|---|---|
| 🔴 CRITICAL | MER4A | No migration exists for `mer4a_submissions`, `mer4a_sas_management_items`, `mer4a_guidance_counseling_items` |
| 🔴 CRITICAL | `2026_02_19_000002` | Duplicate migration filename — two migrations share the same timestamp |
| ⚠️ BUG | `AnnexI1Batch`, `AnnexL1Batch`, `AnnexN1Batch` | `hei()` relationship references `Hei::class` (lowercase) instead of `HEI::class` |
| ⚠️ BUG | `MER1Submission.$fillable` | Contains `hei_name`, `hei_code`, `hei_type`, `hei_address` — columns that do not exist in migration |
| ⚠️ POTENTIAL BUG | `ched_contacts` migration | Missing `use Illuminate\Support\Facades\DB;` — the seed insert will fail on fresh migrate |
| ⚠️ MINOR | `AnnexC1Batch`, `AnnexI1Batch`, `AnnexL1Batch`, `AnnexN1Batch` | `admin_notes` missing from `$fillable` (exists in DB but not mass-assignable) |
| ⚠️ INCONSISTENCY | `AnnexN1SportsProgram` vs `AnnexC1Program` | `implementation_date` cast as `date` in C1 but not in N1 |
| ⚠️ INCONSISTENCY | Category override FKs | `GuidanceCounselling`, `CareerJob`, `Health` overrides have no FK constraint on `program_id` — orphan risk |
| ℹ️ NOTE | `HEI.php` | Only `annexABatches()` relationship defined — all other annexes absent from HEI model |
| ℹ️ NOTE | `MER2Personnel` | No `hasOne(PersonnelCategoryOverride)` defined — override relationship is one-directional only |
