# Excel Export — SummaryView (Styled)

## Problem
Export the SummaryView grid to a styled Excel file matching the official CHED report template.

## Reference Image Layout (Info-Orientation section)
- Row 1: "AY 2024-2025" — full-width merge, dark blue (#1F3864), white bold centered, height 30pt
- Row 2: Section title — medium blue (#2E75B6), white bold, height 24pt
- Row 3: Category group labels (Campus Orientation, Gender-Sensitivity...) — light blue (#BDD7EE), merged per group, height 40pt
- Row 4: Leaf headers — yellow (#FFF2CC), bold, wrap, height 40pt
- Col A: Seq No. (yellow tint), Col B: Name of HEI (yellow tint)
- Data rows: odd=white, even=light green (#E2EFDA), thin black borders everywhere
- Freeze: top header rows + 2 left identity cols

## Architecture

### Files modified
- `resources/js/Utils/excelExport.js` — complete rewrite, uses `xlsx-js-style`
- `resources/js/Pages/Admin/SummaryView.jsx` — added `activeSection` to handleExport call

### Key design choice
Exporter reads structure from `SECTION_COMPARISON_FIELDS` (comparisonConfig.js) directly — NOT from AG Grid columnDefs. This is the single source of truth. Both single-year and comparison use the same field registry.

### Section types
- **Grouped** (groups: [...]): Info-Orientation, Health, Guidance, CareerJob — 3 header rows below title
- **Flat** (fields: [...]): Profile, Personnel, Admission, Discipline, Social, etc. — 2 header rows below title
- **Comparison mode**: year-level groups + optional delta groups between years

### buildLeafDescriptors(sectionId, years, isComparing)
Returns `{ headerGroups, leaves, isGrouped }`:
- `leaves`: flat array of `{ label, field, type, isDelta?, yearAField?, yearBField? }`
- `headerGroups`: for row above leaf headers — `{ label, start, end, style, subGroups? }`

### Header row logic in exportSummaryToExcel
```
curRow 0: Title (always)
curRow 1: Section title (always)
curRow 2: Year/group headers (if headerGroups.length > 0)
  - Identity cols (Seq No. / Name of HEI) written here, merged down to leaf row if needed
curRow 3: Sub-group labels (only for comparison + grouped sections)
curRow N: Leaf headers (always last header row)
headerRowCount = curRow after leaf row written
```

### Cell writing
`setCell(ws, r, c, value, style)` — writes to `ws[XLSX.utils.encode_cell({r,c})]`
Merges via `ws['!merges'] = [{ s:{r,c}, e:{r,c} }, ...]`
Freeze via `ws['!freeze'] = { xSplit: 2, ySplit: headerRowCount }`

## Package Required
```bash
npm install xlsx-js-style
```
Import: `import * as XLSX from 'xlsx-js-style'`
This is a drop-in for `xlsx` that adds cell `.s` style support.

## Status
**IMPLEMENTED** — pending `npm install xlsx-js-style` by user.

## Known edge case / potential issues
- Identity header merge logic: for single grouped sections, identity headers are written on the group label row (curRow 2) and merged down to the leaf header row. Check the merge doesn't double-fire.
- `ws['!freeze']` syntax in xlsx-js-style — if freeze doesn't work try `ws['!sheetViews'] = [{ state: 'frozen', xSplit: 2, ySplit: headerRowCount, topLeftCell: encode_cell({r: headerRowCount, c: 2}) }]`
- Delta values: `resolveDelta(row, yearAField, yearBField)` = `row[yearBField] - row[yearAField]`, returns `''` if either null
- Sections not in comparisonConfig → fallbackExport() (plain dump, no styling) — shouldn't happen, all 15 sections are registered
