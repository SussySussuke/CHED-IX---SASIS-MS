/**
 * excelExport.js  (styled — uses xlsx-js-style)
 *
 * Exports SummaryView data to a formatted Excel file matching the official
 * CHED report template style:
 *   Row 1  — AY {year} title bar (dark blue, merged full width)
 *   Row 2  — Section title (medium blue, merged)
 *   Row 3  — Category/group labels (light blue, merged per group)  [grouped sections only]
 *   Row 4  — Leaf column headers (yellow fill, bold, wrap)
 *   Col A  — Seq No.
 *   Col B  — Name of HEI
 *   Data   — Alternating white / light-green rows, full thin borders
 *
 * Single-year AND multi-year comparison both supported.
 * Column structure is read from SECTION_COMPARISON_FIELDS (single source of truth).
 */

import * as XLSX from 'xlsx-js-style';
import { SECTION_COMPARISON_FIELDS } from '../Config/summaryView/comparisonConfig';
import { summaryConfig } from '../Config/summaryView/summaryConfig';

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const BORDER = {
  top:    { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left:   { style: 'thin', color: { rgb: '000000' } },
  right:  { style: 'thin', color: { rgb: '000000' } },
};

const S_TITLE = {
  fill:      { fgColor: { rgb: '1F3864' } },
  font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 13 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
};

const S_SECTION = {
  fill:      { fgColor: { rgb: '2E75B6' } },
  font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  border:    BORDER,
};

const S_GROUP = {
  fill:      { fgColor: { rgb: 'BDD7EE' } },
  font:      { bold: true, color: { rgb: '1F3864' }, sz: 10 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
};

// Purple tint for second year group in comparison
const S_GROUP2 = {
  fill:      { fgColor: { rgb: 'D9D2E9' } },
  font:      { bold: true, color: { rgb: '351C75' }, sz: 10 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
};

// Delta group style
const S_GROUP_DELTA = {
  fill:      { fgColor: { rgb: 'FCE4D6' } },
  font:      { bold: true, color: { rgb: '843C0C' }, sz: 10 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
};

const S_LEAF_HEADER = {
  fill:      { fgColor: { rgb: 'FFF2CC' } },
  font:      { bold: true, color: { rgb: '000000' }, sz: 10 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
};

const S_IDENTITY_HEADER = {
  fill:      { fgColor: { rgb: 'FFF2CC' } },
  font:      { bold: true, color: { rgb: '000000' }, sz: 10 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
};

const S_IDENTITY_DATA = {
  fill:      { fgColor: { rgb: 'FFFDE7' } },
  font:      { color: { rgb: '000000' } },
  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  border:    BORDER,
};

const S_SEQ = {
  fill:      { fgColor: { rgb: 'FFFDE7' } },
  font:      { color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border:    BORDER,
};

const S_DATA_ODD = {
  fill:      { fgColor: { rgb: 'FFFFFF' } },
  font:      { color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border:    BORDER,
};

const S_DATA_EVEN = {
  fill:      { fgColor: { rgb: 'E2EFDA' } },
  font:      { color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border:    BORDER,
};

const S_EMPTY = { fill: { fgColor: { rgb: 'FFFFFF' } }, border: BORDER };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function addr(r, c) {
  return XLSX.utils.encode_cell({ r, c });
}

function setCell(ws, r, c, value, style) {
  const a = addr(r, c);
  ws[a] = { v: value ?? '', t: typeof value === 'number' ? 'n' : 's', s: style };
}

function addMerge(merges, r1, c1, r2, c2) {
  if (r1 === r2 && c1 === c2) return; // no merge needed for single cell
  merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
}

function formatVal(val) {
  if (val === null || val === undefined) return '';
  if (val === true)  return 'Yes';
  if (val === false) return 'No';
  return val; // keep numbers as numbers
}

function resolveDelta(row, fieldA, fieldB) {
  const a = row[fieldA];
  const b = row[fieldB];
  if (a == null || b == null) return '';
  return b - a;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build leaf column descriptors from comparisonConfig
//
// Returns array of:
//   { label, field, isDelta, yearAField, yearBField, groupStyle }
//
// For single year:  field = raw field name (no year prefix)
// For comparison:   field = "${year}::${rawField}" for normal cols
//                   isDelta=true with yearAField/yearBField for delta cols
// ─────────────────────────────────────────────────────────────────────────────

function buildLeafDescriptors(sectionId, years, isComparing) {
  const config = SECTION_COMPARISON_FIELDS[sectionId];
  if (!config) return { headerGroups: [], leaves: [] };

  const isGrouped = Boolean(config.groups);

  if (!isComparing) {
    // ── Single year ──────────────────────────────────────────────────────────
    const year = years[0];
    if (isGrouped) {
      const headerGroups = []; // { label, startLeafIdx, endLeafIdx, style }
      const leaves = [];
      for (const group of config.groups) {
        const start = leaves.length;
        for (const f of group.fields) {
          leaves.push({ label: f.label, field: f.field, type: f.type });
        }
        headerGroups.push({ label: group.groupLabel, start, end: leaves.length - 1, style: S_GROUP });
      }
      return { headerGroups, leaves, isGrouped: true };
    } else {
      const leaves = config.fields.map((f) => ({ label: f.label, field: f.field, type: f.type }));
      return { headerGroups: [], leaves, isGrouped: false };
    }
  }

  // ── Multi-year comparison ────────────────────────────────────────────────
  const headerGroups = []; // year-level groups
  const leaves = [];

  const groupStyles = [S_GROUP, S_GROUP2]; // alternate colours per year

  for (let yi = 0; yi < years.length; yi++) {
    const year = years[yi];
    const gStyle = groupStyles[yi % groupStyles.length];

    if (isGrouped) {
      // Year top-group spans all its sub-group leaves
      const yearStart = leaves.length;
      const subGroups = [];

      for (const group of config.groups) {
        const subStart = leaves.length;
        for (const f of group.fields) {
          leaves.push({ label: f.label, field: `${year}::${f.field}`, type: f.type });
        }
        subGroups.push({ label: group.groupLabel, start: subStart, end: leaves.length - 1, style: gStyle });
      }

      headerGroups.push({
        label: year,
        start: yearStart,
        end: leaves.length - 1,
        style: gStyle,
        subGroups,
      });
    } else {
      const yearStart = leaves.length;
      for (const f of config.fields) {
        leaves.push({ label: f.label, field: `${year}::${f.field}`, type: f.type });
      }
      headerGroups.push({ label: year, start: yearStart, end: leaves.length - 1, style: gStyle });
    }

    // Delta group (between consecutive years)
    if (yi < years.length - 1) {
      const nextYear = years[yi + 1];
      const numericFields = isGrouped
        ? config.groups.flatMap((g) => g.fields.filter((f) => f.type === 'numeric'))
        : config.fields.filter((f) => f.type === 'numeric');

      if (numericFields.length > 0) {
        const deltaStart = leaves.length;
        for (const f of numericFields) {
          leaves.push({
            label:     f.label,
            isDelta:   true,
            yearAField: `${year}::${f.field}`,
            yearBField: `${nextYear}::${f.field}`,
            type:      'numeric',
          });
        }
        headerGroups.push({
          label: `Δ ${year} → ${nextYear}`,
          start: deltaStart,
          end:   leaves.length - 1,
          style: S_GROUP_DELTA,
        });
      }
    }
  }

  return { headerGroups, leaves, isGrouped };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function exportSummaryToExcel({
  sectionData,
  columnDefs,   // not used for structure — we use comparisonConfig directly
  sectionTitle,
  selectedYears,
  isComparing,
  activeSection,
}) {
  if (!sectionData?.length) return;

  const config = SECTION_COMPARISON_FIELDS[activeSection];
  if (!config) {
    // Fallback: plain dump for sections not in comparisonConfig
    fallbackExport({ sectionData, columnDefs, sectionTitle, selectedYears });
    return;
  }

  const { headerGroups, leaves, isGrouped } = buildLeafDescriptors(activeSection, selectedYears, isComparing);
  if (!leaves.length) return;

  const ws = {};
  const merges = [];

  // ── Layout constants ─────────────────────────────────────────────────────
  const IDENTITY_COLS = 2; // col 0 = Seq No., col 1 = Name of HEI
  const totalCols = IDENTITY_COLS + leaves.length;

  // Header row count depends on section type
  // Row 0: Title (AY …)
  // Row 1: Section title
  // Row 2: Year groups (comparison) OR group labels (single grouped)  ← only if needed
  // Row 3: Sub-group labels (comparison + grouped)                    ← only if needed
  // Last header row: leaf headers

  let curRow = 0;

  // ── Row 0: AY Title ──────────────────────────────────────────────────────
  const titleText = isComparing
    ? `AY ${selectedYears.join(' vs ')}`
    : `AY ${selectedYears[0] ?? ''}`;

  setCell(ws, curRow, 0, titleText, S_TITLE);
  for (let c = 1; c < totalCols; c++) setCell(ws, curRow, c, '', S_TITLE);
  addMerge(merges, curRow, 0, curRow, totalCols - 1);
  curRow++;

  // ── Row 1: Section title ─────────────────────────────────────────────────
  const fullSectionTitle = summaryConfig.getSection(activeSection)?.sectionTitle ?? sectionTitle;
  setCell(ws, curRow, 0, fullSectionTitle, S_SECTION);
  for (let c = 1; c < totalCols; c++) setCell(ws, curRow, c, '', S_SECTION);
  addMerge(merges, curRow, 0, curRow, totalCols - 1);
  curRow++;

  // ── Row 2 (optional): Year-level groups or flat group labels ─────────────
  //
  // Comparison mode:    year group headers + delta group headers
  // Single grouped:     group headers (Campus Orientation, etc.)
  // Single flat:        skip this row

  const hasGroupRow = headerGroups.length > 0;

  if (hasGroupRow) {
    // Identity header cells (span row 2 + row 3 if sub-groups exist, else just row 2)
    const hasSubGroupRow = isComparing && isGrouped;
    const identityRowSpanEnd = hasSubGroupRow ? curRow + 1 : curRow;

    setCell(ws, curRow, 0, 'Seq No.',     S_IDENTITY_HEADER);
    setCell(ws, curRow, 1, 'Name of HEI', S_IDENTITY_HEADER);
    if (hasSubGroupRow) {
      setCell(ws, curRow + 1, 0, '', S_IDENTITY_HEADER);
      setCell(ws, curRow + 1, 1, '', S_IDENTITY_HEADER);
      addMerge(merges, curRow, 0, identityRowSpanEnd, 0);
      addMerge(merges, curRow, 1, identityRowSpanEnd, 1);
    }

    for (const grp of headerGroups) {
      const colStart = IDENTITY_COLS + grp.start;
      const colEnd   = IDENTITY_COLS + grp.end;
      setCell(ws, curRow, colStart, grp.label, grp.style);
      for (let c = colStart + 1; c <= colEnd; c++) setCell(ws, curRow, c, '', grp.style);
      addMerge(merges, curRow, colStart, curRow, colEnd);
    }
    curRow++;

    // ── Row 3 (optional): Sub-group labels for comparison+grouped ──────────
    if (hasSubGroupRow) {
      for (const grp of headerGroups) {
        if (!grp.subGroups) {
          // Delta group — no sub-groups, just blank the cols spanning leaf row
          const colStart = IDENTITY_COLS + grp.start;
          const colEnd   = IDENTITY_COLS + grp.end;
          for (let c = colStart; c <= colEnd; c++) setCell(ws, curRow, c, '', grp.style);
        } else {
          for (const sub of grp.subGroups) {
            const colStart = IDENTITY_COLS + sub.start;
            const colEnd   = IDENTITY_COLS + sub.end;
            setCell(ws, curRow, colStart, sub.label, sub.style);
            for (let c = colStart + 1; c <= colEnd; c++) setCell(ws, curRow, c, '', sub.style);
            addMerge(merges, curRow, colStart, curRow, colEnd);
          }
        }
      }
      curRow++;
    }
  }

  // ── Leaf header row ───────────────────────────────────────────────────────
  if (!hasGroupRow) {
    // For flat single-year: identity headers are on the leaf row
    setCell(ws, curRow, 0, 'Seq No.',     S_IDENTITY_HEADER);
    setCell(ws, curRow, 1, 'Name of HEI', S_IDENTITY_HEADER);
  } else {
    // Already written above (or spanned) — write empty styled cells
    // only if identity cells were already merged vertically
    const alreadyMerged = hasGroupRow;
    if (!alreadyMerged || !(isComparing && isGrouped)) {
      // For single grouped: identity headers were written on the group row, span down
      setCell(ws, curRow, 0, '', S_IDENTITY_HEADER);
      setCell(ws, curRow, 1, '', S_IDENTITY_HEADER);
      addMerge(merges, curRow - 1, 0, curRow, 0);
      addMerge(merges, curRow - 1, 1, curRow, 1);
    }
  }

  for (let li = 0; li < leaves.length; li++) {
    setCell(ws, curRow, IDENTITY_COLS + li, leaves[li].label, S_LEAF_HEADER);
  }
  curRow++;

  const headerRowCount = curRow; // freeze up to here

  // ── Data rows ─────────────────────────────────────────────────────────────
  sectionData.forEach((row, idx) => {
    const rowStyle = idx % 2 === 0 ? S_DATA_ODD : S_DATA_EVEN;

    setCell(ws, curRow, 0, idx + 1, S_SEQ);
    setCell(ws, curRow, 1, row.hei_name ?? '', S_IDENTITY_DATA);

    for (let li = 0; li < leaves.length; li++) {
      const leaf = leaves[li];
      let val;

      if (leaf.isDelta) {
        val = resolveDelta(row, leaf.yearAField, leaf.yearBField);
      } else {
        val = formatVal(row[leaf.field]);
      }

      setCell(ws, curRow, IDENTITY_COLS + li, val, rowStyle);
    }

    curRow++;
  });

  // ── Worksheet metadata ────────────────────────────────────────────────────
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: curRow - 1, c: totalCols - 1 } });
  ws['!merges'] = merges;

  // Column widths
  ws['!cols'] = [
    { wch: 6 },  // Seq No.
    { wch: 35 }, // Name of HEI
    ...leaves.map((l) => ({ wch: Math.max(l.label?.length ?? 10, 12) })),
  ];

  // Row heights
  ws['!rows'] = [];
  ws['!rows'][0] = { hpt: 30 }; // title row
  ws['!rows'][1] = { hpt: 24 }; // section row
  for (let r = 2; r < headerRowCount; r++) {
    ws['!rows'][r] = { hpt: 40 }; // header rows (taller for wrap)
  }

  // Freeze panes: freeze top headerRowCount rows + 2 left cols
  ws['!freeze'] = { xSplit: IDENTITY_COLS, ySplit: headerRowCount };

  // ── Workbook + download ───────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  const sheetName = (fullSectionTitle ?? sectionTitle).replace(/[\/\\?*[\]]/g, '-').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const yearLabel = isComparing
    ? selectedYears.join('_vs_')
    : (selectedYears[0] ?? 'unknown');
  const safeTitle = (fullSectionTitle ?? sectionTitle).replace(/[^a-zA-Z0-9\-_]/g, '_');
  XLSX.writeFile(wb, `Summary_${safeTitle}_${yearLabel}.xlsx`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback: plain export for sections not in comparisonConfig
// (shouldn't happen since all 15 sections are registered, but just in case)
// ─────────────────────────────────────────────────────────────────────────────

function fallbackExport({ sectionData, columnDefs, sectionTitle, selectedYears }) {
  function flattenCols(cols) {
    const out = [];
    for (const col of cols) {
      if (col.children) out.push(...flattenCols(col.children));
      else out.push({ header: col.headerName ?? '', field: col.field ?? null, valueGetter: col.valueGetter ?? null });
    }
    return out;
  }

  const leaves = flattenCols(columnDefs);
  const headerRow = leaves.map((l) => l.header);
  const dataRows  = sectionData.map((row) =>
    leaves.map((l) => {
      if (typeof l.valueGetter === 'function') {
        try { return l.valueGetter({ data: row }) ?? ''; } catch { return ''; }
      }
      return formatVal(row[l.field]);
    })
  );

  const ws  = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
  const wb  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sectionTitle.slice(0, 31));
  const year = selectedYears[0] ?? 'unknown';
  XLSX.writeFile(wb, `Summary_${sectionTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${year}.xlsx`);
}
