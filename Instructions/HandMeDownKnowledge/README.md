# Hand-Me-Down Knowledge — Master Index

This folder contains **context files** written session-by-session to preserve decisions, discoveries, and fixes so the next Claude instance doesn't have to rediscover them.

**Rule of thumb:** Don't load everything. Read this file first, identify which `.md` files are relevant to your current task, then load only those.

---

## What Lives Here

### 🏗️ Foundation & Architecture

| File | What It Covers | Read When... |
|------|----------------|--------------|
| `schema-analysis.md` | **Full DB schema** — every model/migration pair, known bugs (`Hei::class` casing, MER1 ghost fillable, duplicate migration filenames), status enum, architecture pattern (Annex UUID vs MER integer FK), seeder account list | You're touching migrations, models, or doing anything DB-level. Also read before running `migrate:fresh`. |
| `seeder-and-demo-data.md` | All 5 demo HEIs, 8 user accounts, which HEI has which annexes seeded, partial coverage tables, AY ranges | You need to know what demo data exists, which HEI to test with, or you're modifying the seeder. |
| `summaryView-backend-architecture.md` | The Service layer extraction for SummaryView — `app/Services/Summary/` directory, `CategoryKeywordMatcher`, one service per section, `StaticSectionSummaryService`, `EvidenceRequest`, route model binding fix | You're working on any backend SummaryView endpoint, evidence drilldown, or the service layer. |

---

### 📊 SummaryView (Admin Reports Page)

This feature is the most complex in the system. Multiple files cover it from different angles.

| File | What It Covers | Read When... |
|------|----------------|--------------|
| `year-comparison-feature.md` | **Core comparison mode architecture** — `YearMultiSelect`, `buildComparisonColumns`, `buildComparisonRows`, `openDrilldown` signature, `RecordsModal`, CSRF fix, all resolved bugs | You're touching comparison mode, drilldown modal, or `SummaryView.jsx` at all. |
| `summaryView-comparison-drilldown.md` | Deep dive on drilldown clickability in comparison mode — zero-total inert state, `buildLeafCol`, `comparisonConfig.js` field clickability, `__missing` year gap bug | You're fixing/adding clickable cells in comparison mode or the zero-total guard logic. |
| `summaryview-grand-total-row.md` | Pinned "Grand Total" row — `computeTotalsRow`, `SECTION_NUMERIC_FIELDS`, `applyPinnedRowGuard`, which sections are excluded | You're touching the grand total row, `AGGridViewer.jsx` pinned rows, or section totals logic. |
| `delta-column-toggle.md` | Δ column show/hide toggle — `showDelta` state, `buildComparisonColumns` 4th param, export integration | You're touching the delta toggle button or Δ column visibility in grid or export. |
| `excel-export-summaryview.md` | Styled Excel export of SummaryView — `xlsx-js-style`, header row logic, cell styles, the `stream.Readable` Vite crash fix (dynamic import), single-year vs comparison export | You're touching the Excel export button on SummaryView or `excelExport.js`. |
| `summary-view-profile-blank-on-year-change.md` | Bug fix — Profile section blanking on year change. `fullFields: true` was missing in `getProfileData()`. | You see blank columns in the Profile section on year change — one-liner fix, read this first. |

---

### 📋 HEI Submission Forms

| File | What It Covers | Read When... |
|------|----------------|--------------|
| `excel-import-export.md` | Full HEI Excel import/export — all 19 annex sheets, layout per sheet, color scheme, `AnnexDParser` explicit row/col design, conflict resolution flow, `ExcelPersistService` | You're touching `ExcelExportService`, `ExcelImportService`, any annex parser, or the import/export UI. |
| `annex-j-participant-split.md` | Schema fix — `annex_j_programs` split from `number_of_participants` into `participants_online` + `participants_face_to_face`. Migration + model + controller + seeder all updated. | You're working on Annex J data or notice participant columns missing/wrong. |
| `hei-summary-create-form.md` | HEI-side Summary (1A-Profile) form — `social_media_contacts` type mismatch fix, `toContactsArray()` normalizer, `submitted_org_chart` field type change (string → URL), UI redesign | You're modifying the Summary create/edit form or `SummaryController`. |
| `submissions-list-form-filter-grouping.md` | Bug fix — "Profile" visually appearing as a group header in the form filter dropdown. Root cause: `All Forms` bolted onto the first group's options instead of its own top-level entry. | You see grouping weirdness in `SearchableSelect` or the form filter dropdown. |
| `annex-g-submissions-list-not-showing.md` | Bug fix — Annex G not showing in Submissions List, and its expand tables empty. Four bugs: wrong `batch_id` (G uses `submission_id` UUID), wrong `formSection.key` in renderer config (`batch` → `form_data`), incomplete `form_data` response, invented column field names. | You're touching Annex G rendering, the `getSubmissions()` loop, `ANNEX_G_CONFIG`, or any annex that uses `submission_id` instead of `batch_id`. |

---

### 🖥️ Admin Dashboard & Management

| File | What It Covers | Read When... |
|------|----------------|--------------|
| `admin-dashboard-top-performing-heis.md` | Top Performing HEIs widget — clickable cards, missing forms badge, per-form breakdown panel, split-modal CSS transitions, `requestAnimationFrame` fix, `DashboardService::getHeiFormBreakdown()` | You're touching `TopPerformingHEIs.jsx`, `DashboardService`, or the breakdown panel endpoint. |
| `superadmin-management-pages.md` | SuperAdmin HEI/Admin/CHED Contact management pages + SuperAdmin Dashboard — `HEIManagementService`, `CHEDContactService` extraction, `DashboardService` extraction, Total Admins stat card | You're working on SuperAdmin routes/pages or the shared dashboard service. |
| `audit-log-display-hardening.md` | Audit log UI — `AuditLogResource`, `FIELD_LABELS` per entity type, `ValuesTable` component replacing raw JSON display | You're touching audit logs display, `AuditLogResource`, or adding new entity types to the label map. |
| `mer4-admin-form-rendering-and-remarks.md` | MER4 admin form — `annex_type` format mismatch bug (`annex_a` vs `A`), wrong API URL (`/mer/` vs `/mer4/`), `normalizeAnnexType()` fix, CHED Remarks save flow | You're working on MER4 admin forms, `MER4TableComponent`, or the remarks batch save endpoint. |

---

### 🎨 HEI Dashboard & UX

| File | What It Covers | Read When... |
|------|----------------|--------------|
| `hei-dashboard-animations-skeleton.md` | Dashboard entrance animations — `animate-enter` keyframe, `AnimatedSection` stagger, `DeadlineAlert` RAF fill + confetti, `STATUS_STYLES`, `NeedHelp` skeleton rebuild | You're touching HEI dashboard animations, `DeadlineAlert`, or the NeedHelp skeleton. |
| `hei-dashboard-recent-activity.md` | Recent Activity bug fix — fake `defaultActivities` removed, Summary double-count in `DashboardController` fixed | You see duplicate or fake data in the Recent Activity feed. |
| `hei-about-page.md` | Static HEI About page — closure route, `NeedHelp` modal reuse, `showHeader={false}` pattern, `react-icons/io5` naming pitfall | You're adding or modifying the About page or similar static HEI pages. |

---

### ⚙️ System / Infrastructure

| File | What It Covers | Read When... |
|------|----------------|--------------|
| `submission-publish-deadline-command.md` | `PublishSubmittedBatches` artisan command — auto-publishes all `submitted` records after deadline, cache invalidation, `AuditLog::logSystem()`, `user_role = 'system'` migration | You're touching the deadline command, `AuditLog` CLI usage, or `Setting::getDeadline()`. |

---

### 🗒️ Misc / Plain Text Notes

| File | What It Covers |
|------|----------------|
| `419-login-app-url-mismatch.txt` | CSRF 419 on login — notes on app URL mismatch fix |
| `419-logout-csrf-fix.txt` | CSRF 419 on logout — fix notes |

---

## How to Use This as a New Claude Instance

1. **Read this README first** (you're doing it right now ✓)
2. **Identify your task** — what feature or file are you touching?
3. **Load only the relevant `.md` files** using the table above
4. If you're doing something DB-level or fresh-migrating → always load `schema-analysis.md`
5. If you're touching SummaryView at all → start with `year-comparison-feature.md`, then load the specific sub-topic file

**Don't load all files at once** — that's a token waste. This README exists precisely so you don't have to.

---

## Project Architecture Reminders (quick ref)

- **Controllers are thin** — logic lives in `app/Services/`
- **Annex forms** use UUID `batch_id` as FK; **MER forms** use integer `submission_id` as FK
- **FormConfigService** is the canonical source of all 24 form types — don't query form lists elsewhere
- **Cache key** for admin dashboard: `admin_dashboard_stats_{year}` — run `php artisan cache:clear` after touching `DashboardService`
- **`overwritten` status** exists on MER forms but not on Annex batches — check before adding status logic
- **`Hei::class` bug** — some models (AnnexI1Batch, L1, N1) reference wrong casing; they'll throw if the `hei()` relationship is called
