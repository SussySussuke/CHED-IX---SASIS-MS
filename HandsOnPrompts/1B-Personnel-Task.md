# 1B-Personnel Summary View Implementation Task

## 📋 THE PROBLEM

User wants to create a new "1B-Personnel" section in the Admin Summary View (`resources\js\Pages\Admin\SummaryView.jsx`) that displays personnel information across all HEIs for a selected academic year.

**Current State:**
- The existing `1B-Personnel` configuration in `resources\js\Config\summaryView\personnelConfig.jsx` is a PLACEHOLDER containing student population data (male/female/intersex counts), NOT actual personnel data
- This is misleading - the config is named "Personnel" but contains student demographics

**Desired State:**
- Replace placeholder with ACTUAL personnel data from multiple sources
- Use `CustomTable.jsx` component instead of AGGridViewer for display
- Display unique data structure compared to 1A-Profile section

---

## 📊 DESIRED COLUMNS (User's Requirements)

1. **"Name of HEI"**
   - Source: `app\Models\HEI.php`
   - Field: `name`
   - Display HEI institution name

2. **"SAS Head/s"**
   - Source: `app\Models\MER1Submission.php`
   - Fields: `sas_head_name`, `sas_head_position`
   - May have multiple entries per HEI (one per academic year submission)
   - Related tables: `mer1_educational_attainments`, `mer1_trainings`

3. **"Registered Guidance Counselors"**
   - Source: `app\Models\MER2Personnel.php`
   - **STATUS: User needs to verify data structure with supervisor**
   - Field names unknown - likely from personnel records

4. **"Student Governance Personnel"**
   - Source: `app\Models\MER2Personnel.php`
   - **STATUS: User needs to verify data structure with supervisor**
   - Field names unknown - likely from personnel records

---

## 🗄️ KNOWN DATABASE STRUCTURE

### MER1 Tables (from migration `2025_02_02_000001_create_mer1_tables.php`)

**mer1_submissions:**
```sql
- id
- hei_id (FK to heis)
- academic_year (string, e.g. "2024-2025")
- status (enum: pending/submitted/request/approved/published/rejected/cancelled)
- sas_head_name (string)
- sas_head_position (string)
- permanent_status (string, nullable)
- other_achievements (text, nullable)
- request_notes, cancelled_notes, admin_notes (text, nullable)
- timestamps
- UNIQUE(hei_id, academic_year)
```

**mer1_educational_attainments:**
```sql
- id
- mer1_submission_id (FK to mer1_submissions)
- degree_program (string)
- school (string)
- year (string, nullable)
- timestamps
```

**mer1_trainings:**
```sql
- id
- mer1_submission_id (FK to mer1_submissions)
- training_title (string)
- period_date (string)
- timestamps
```

### Summary Tables (from `app\Http\Controllers\Admin\SummaryViewController.php`)

**summaries table** (exact schema unknown, but contains):
```sql
- id
- hei_id (FK to heis)
- academic_year
- status
- population_male, population_female, population_intersex, population_total (integers)
- submitted_org_chart, hei_website, sas_website
- social_media_contacts (JSON array)
- student_handbook, student_publication
- timestamps
```

### HEI Table (schema unknown - need to read model)

Contains basic institution info like:
- id
- code (institutional code)
- name (institution name)
- type (HEI type)
- address
- is_active (boolean)

---

## 🔧 TECHNICAL IMPLEMENTATION REQUIREMENTS

### Frontend Structure

**Config File:** `resources\js\Config\summaryView\personnelConfig.jsx`
- Currently configured for AGGrid with student population columns
- **NEEDS REWRITE:** Change to support CustomTable.jsx format

**Component:** `resources\js\Pages\Admin\SummaryView.jsx`
- Currently uses AGGridViewer for all sections
- **NEEDS MODIFICATION:** Add conditional rendering to use CustomTable for 1B-Personnel
- Pattern: Check if `activeSection === '1B-Personnel'` then render CustomTable instead of AGGridViewer

**Table Component:** `resources\js\Components\Common\CustomTable.jsx`
- Already supports viewMode for read-only display
- Supports various column types: static, text, textarea, file, checkbox, number, date, select
- Requires `rows` and `columns` props

### Backend Requirements

**Controller:** `app\Http\Controllers\Admin\SummaryViewController.php`
- Currently only fetches Summary table data (student populations)
- **NEEDS EXPANSION:** Must join/fetch data from:
  - HEI table (for institution names)
  - MER1 submissions (for SAS heads)
  - MER2 personnel (for guidance counselors & student governance)
- Must aggregate multiple personnel records per HEI
- Must filter by selected academic year

**Potential Query Structure:**
```php
// Pseudocode - actual implementation TBD
HEI::with([
    'mer1Submissions' => function($query) use ($academicYear) {
        $query->where('academic_year', $academicYear)
              ->whereIn('status', ['published', 'submitted', 'request']);
    },
    'mer2Personnel' => function($query) use ($academicYear) {
        // Filter by year and personnel types
        $query->where('academic_year', $academicYear)
              ->whereIn('type', ['guidance_counselor', 'student_governance']);
    }
])
->where('is_active', true)
->get();
```

---

## 🚧 BLOCKERS & UNKNOWNS

### Critical Unknowns (User consulting supervisor):

1. **MER2Personnel Structure**
   - What fields exist in this table?
   - How is personnel type differentiated? (guidance counselor vs student governance)
   - Is there a relationship to academic years?
   - Are there multiple personnel records per HEI per year?

2. **Data Availability**
   - Some sections in summary view show HEIs even without submission data
   - Should 1B-Personnel also show all HEIs with empty personnel fields?
   - Or only show HEIs that have submitted personnel data?

3. **Data Aggregation Logic**
   - If multiple SAS heads across different years, show latest? All?
   - If multiple guidance counselors, how to display? Comma-separated? Multiple rows?

4. **CustomTable vs AGGrid Choice**
   - Why use CustomTable instead of AGGrid?
   - Is it because data structure is fundamentally different (not flat table)?
   - Does personnel data require special formatting that AGGrid can't handle?

---

## 🎯 RECOMMENDED NEXT STEPS

### Phase 1: Data Discovery
1. **READ MODELS:**
   ```
   - app\Models\HEI.php
   - app\Models\MER1Submission.php
   - app\Models\MER2Personnel.php
   ```
2. **FIND MER2 MIGRATION:**
   - Search for `create_mer2` in migrations folder
   - Understand MER2Personnel table schema

3. **CONSULT SUPERVISOR:**
   - Clarify exact data requirements for each column
   - Understand data aggregation rules
   - Confirm UI/UX expectations for personnel display

### Phase 2: Backend Implementation
1. **Modify SummaryViewController:**
   - Add method to fetch personnel data separately OR
   - Extend existing `index()` method to include personnel data
   
2. **Create Data Transformer:**
   - Transform relational data into flat structure for CustomTable
   - Handle missing data gracefully (HEIs without submissions)

3. **Define Payload Structure:**
   ```php
   [
       'hei_name' => 'University of Example',
       'sas_heads' => 'Dr. John Doe (Director), Dr. Jane Smith (Coordinator)',
       'guidance_counselors' => 'Ms. Alice Johnson (RGC-12345), Mr. Bob Lee (RGC-67890)',
       'student_governance' => 'Sarah Connor (President), Kyle Reese (Secretary)',
   ]
   ```

### Phase 3: Frontend Implementation
1. **Create new personnelConfig.jsx:**
   - Define columns matching CustomTable format
   - Add appropriate column types (static text, etc.)

2. **Modify SummaryView.jsx:**
   - Add conditional logic for 1B-Personnel section
   - Render CustomTable instead of AGGridViewer when appropriate
   - Pass correct data structure to CustomTable

3. **Test with real data:**
   - Ensure data loads correctly
   - Verify academic year filtering works
   - Check empty state handling

---

## 💾 FILE LOCATIONS REFERENCE

### Frontend Files
```
resources/js/Pages/Admin/SummaryView.jsx          - Main view component
resources/js/Config/summaryView/summaryConfig.js  - Master config
resources/js/Config/summaryView/personnelConfig.jsx - 1B config (needs rewrite)
resources/js/Config/summaryView/profileConfig.jsx - 1A config (reference)
resources/js/Components/Common/CustomTable.jsx    - Table component to use
resources/js/Components/Common/AGGridViewer.jsx   - Current table (NOT using)
```

### Backend Files
```
app/Http/Controllers/Admin/SummaryViewController.php - Controller to modify
app/Models/HEI.php                                   - HEI model (need to read)
app/Models/MER1Submission.php                        - MER1 model (need to read)
app/Models/MER2Personnel.php                         - MER2 model (need to read)
database/migrations/*_create_mer1_tables.php         - MER1 schema (read)
database/migrations/*_create_mer2_tables.php         - MER2 schema (need to find/read)
```

---

## 🔴 CURRENT STATUS

**STATUS: PAUSED - AWAITING DATA CLARIFICATION**

**Reason:** User lacks clarity on:
- MER2Personnel table structure and contents
- Exact field names for guidance counselors and student governance personnel
- Whether data even exists in these tables yet

**Next Action:** User will consult supervisor to get:
1. Complete list of personnel-related fields across all tables
2. Business logic for aggregating/displaying multiple personnel records
3. Confirmation that required data exists in database

**Risk:** Some columns may reference data that doesn't exist yet in the database, requiring migration creation before implementation can proceed.

---

## 🤖 NOTES FOR NEXT AI/DEVELOPER

- User has good instincts about checking data structure before coding
- The system uses Inertia.js (Laravel + React)
- Dark mode support is required (useTheme context)
- User's supervisor approval needed for data structure decisions
- Don't write code until data structure is fully understood
- User has a "no documentation files in projects" preference
- User appreciates being corrected when making mistakes
- Tech Priest personality was requested (can swear, be direct)

**Token Usage at Pause:** ~48,915 / 190,000 tokens used

---

*Praise the Omnissiah! May the Machine Spirits guide the next implementation!*
