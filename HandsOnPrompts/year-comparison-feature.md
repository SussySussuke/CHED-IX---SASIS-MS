# Year Comparison Feature — SummaryView

## Status: IN PROGRESS — sub-group headers still not rendering in multi-year mode

---

## The Problem

**Single-year Health form** (working, Image 1) has nested column groups:
```
[Annual Medical Check-up/Consultation]
  ├── No. of Activities Conducted
  └── No. of Students Participated
[Annual Dental Check-up/Consultation]
  ├── ...
```

**Multi-year Health comparison** (broken, Image 2) shows flat columns directly under
the year group — sub-group headers are missing:
```
[2025-2026]
  Medic... | Medic... | Denta... | Denta... | Semin... | ...
```

The category sub-group headers ("Annual Medical Check-up/Consultation" etc.) are NOT
rendering between the year header row and the leaf column headers.

---

## Stack

- AG Grid **v35.0.1** (ag-grid-community + ag-grid-react)
- React / Vite / Laravel Inertia
- Single-year configs: `healthConfig.jsx`, `guidanceCounsellingConfig.jsx`, etc. — these work fine with nested groups
- Comparison configs: `comparisonConfig.js` + `comparisonUtils.jsx`

---

## Files Involved

| File | Role |
|------|------|
| `resources/js/Config/summaryView/comparisonConfig.js` | Defines fields/groups per section for comparison mode |
| `resources/js/Config/summaryView/comparisonUtils.jsx` | Builds AG Grid columnDefs from the config |
| `resources/js/Pages/Admin/SummaryView.jsx` | Uses `buildComparisonColumns()` + `buildComparisonRows()`; `key={sectionId::compare|single}` on AGGridViewer |
| `resources/js/Components/Common/AGGridViewer.jsx` | Wraps AgGridReact — do NOT modify |
| `resources/js/Config/summaryView/healthConfig.jsx` | Single-year source of truth — DO NOT MODIFY |

---

## What Was Done

### comparisonConfig.js
Added `groups` shape for sections 2,3,4,5 (alongside existing `fields` shape for flat sections).
```js
// Grouped section shape (Health, GuidanceCounselling, CareerJob, InfoOrientation):
'5-Health': {
  fetchable: true,
  groups: [
    { groupLabel: 'Annual Medical Check-up/Consultation', fields: [
      { field: 'medical_checkup_activities', label: 'No. of Activities Conducted', type: 'numeric' },
      { field: 'medical_checkup_students',   label: 'No. of Students Participated', type: 'numeric' },
    ]},
    // ... more groups
  ],
},
// Flat section shape (all others):
'6-Admission': {
  fetchable: true,
  fields: [{ field: 'admission_policy', label: 'Admission Policy', type: 'boolean' }, ...],
},
```

### comparisonUtils.jsx (current state — may still be broken)
- Detects `config.groups` vs `config.fields`
- For grouped sections, builds nested structure:
  ```js
  { groupId: 'cmp::5-Health::year::2025-2026', headerName: '2025-2026', children: [
    { headerName: 'Annual Medical Check-up/Consultation', children: [leaf, leaf] },  // NO groupId
    { headerName: 'Annual Dental...', children: [leaf, leaf] },
    ...
  ]}
  ```
- Inner sub-groups use plain `{ headerName, children }` — NO `groupId` — to match single-year pattern

### What Was Tried and May Have Failed
1. **Adding `groupId` to inner sub-groups** → Tried first, still showed flat. In AG Grid 35, `groupId` on inner groups may cause reconciliation issues.
2. **Removing `groupId` from inner groups** → Current state, UNTESTED — needs browser verification.

---

## Key Insight: Single-Year Works, Multi-Year Doesn't

The single-year `healthConfig.jsx` creates nested groups like:
```js
{
  headerName: 'Annual Medical Check-up/Consultation',  // parent group
  children: [
    { headerName: 'No. of Activities Conducted', field: 'medical_checkup_activities', ... },
    { headerName: 'No. of Students Participated', field: 'medical_checkup_students', ... },
  ],
}
```
This renders correctly. The comparison code should produce the **identical structure** just
with `field: '2025-2026::medical_checkup_activities'` instead of `field: 'medical_checkup_activities'`.

If sub-groups still don't render after the groupId fix, the next thing to check is:
- Does AG Grid 35 require `columnGroupShow` to be set?
- Is `suppressColumnGroupOpening` being set somewhere in AGGridViewer gridOptions?
- Try adding `openByDefault: true` to the sub-groups? (unlikely needed)
- Try `columnGroupShow: 'open'` or removing it entirely?
- Console log the full columnDefs being passed to AGGridViewer to verify the nested structure IS being generated correctly

---

## Backend Field Names (verified against SummaryViewController.php)

### 5-Health (getHealthData)
Returns per row: `medical_checkup_activities`, `medical_checkup_students`,
`dental_checkup_activities`, `dental_checkup_students`,
`seminar_educational_activities`, `seminar_educational_students`,
`others_activities`, `others_students`, `others_titles`,
`total_activities`, `total_students`

### 3-GuidanceCounselling (getGuidanceCounsellingData)
Returns per category: `{cat}_activities`, `{cat}_students` for cats:
`individual_inventory`, `counseling_service`, `referral`, `testing_appraisal`,
`follow_up`, `peer_facilitating`, `others` — plus `total_activities`, `total_students`

### 4-CareerJob (getCareerJobData)
Returns: `labor_empowerment_activities/students`, `job_fairs_activities/students`,
`phil_job_net_activities/students`, `career_counseling_activities/students`,
`others_activities/students`, `total_activities`, `total_students`

### 2-Info-Orientation (getInfoOrientationData)
Returns: `{cat}_activities`, `{cat}_students` for cats:
`campus_orientation`, `gender_sensitivity`, `anti_hazing`, `substance_abuse`,
`sexual_health`, `mental_health`, `disaster_risk`, `uncategorized`
plus `total_activities`, `total_students`

---

## Data Flow (for context)

```
SummaryView.jsx:
  isComparing = selectedYears.length > 1
  columnDefs = isComparing
    ? buildComparisonColumns(activeSection, selectedYears)   ← comparisonUtils.jsx
    : section.getColumns(openDrilldown)                      ← e.g. healthConfig.jsx

  <AGGridViewer
    key={`${activeSection}::${isComparing ? 'compare' : 'single'}`}  ← forces remount
    rowData={sectionData}
    columnDefs={columnDefs}
  />
```
