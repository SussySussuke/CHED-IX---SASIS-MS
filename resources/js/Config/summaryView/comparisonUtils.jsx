/**
 * comparisonUtils.jsx
 *
 * Pure utility functions for multi-year comparison mode in SummaryView.
 *
 * ─── Column structure ───────────────────────────────────────────────────────
 *
 * Sections with flat `fields`:
 *   [HEI Code pinned] [Name of HEI pinned] [Type pinned]
 *   [Year A]  →  flat leaf cols
 *   [Δ A→B]   →  flat delta leaf cols (numeric only)
 *   [Year B]  →  flat leaf cols
 *
 * Sections with `groups` (Health, Guidance, CareerJob, InfoOrientation):
 *   [HEI Code pinned] [Name of HEI pinned] [Type pinned]
 *   [Year A]
 *     [Category sub-group]  →  leaf cols
 *     [Category sub-group]  →  leaf cols
 *     ...
 *   [Δ A→B]
 *     [Category sub-group]  →  delta leaf cols (numeric only)
 *     ...
 *   [Year B]
 *     same sub-group structure
 *
 * ─── AG Grid column group rules (v35) ───────────────────────────────────────
 * - Use plain { headerName, children } — NO groupId on inner groups.
 *   groupId on inner groups in AG Grid 35 changes reconciliation and can
 *   suppress intermediate header rendering.
 * - Top-level year/delta groups use groupId (safe, they're top-level).
 * - Every leaf column has an explicit colId so AG Grid never recycles stale
 *   column state across section/mode changes.
 */

import { SECTION_COMPARISON_FIELDS } from './comparisonConfig';

// ─────────────────────────────────────────────────────────────────────────────
// buildComparisonRows
// ─────────────────────────────────────────────────────────────────────────────

export function buildComparisonRows(dataByYear, years) {
  const heiMap = new Map();

  for (const year of years) {
    for (const row of (dataByYear[year] ?? [])) {
      if (!heiMap.has(row.hei_id)) {
        heiMap.set(row.hei_id, {
          hei_id:   row.hei_id,
          hei_code: row.hei_code,
          hei_name: row.hei_name,
          hei_type: row.hei_type,
        });
      }
    }
  }

  const result = [];

  for (const [heiId, base] of heiMap) {
    const merged = { ...base };

    for (const year of years) {
      const row = (dataByYear[year] ?? []).find((r) => r.hei_id === heiId) ?? null;

      if (row) {
        for (const [key, val] of Object.entries(row)) {
          if (['hei_id', 'hei_code', 'hei_name', 'hei_type'].includes(key)) continue;
          merged[`${year}::${key}`] = val;
        }
      } else {
        merged[`${year}::__missing`] = true;
      }
    }

    result.push(merged);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// buildComparisonColumns
// ─────────────────────────────────────────────────────────────────────────────

export function buildComparisonColumns(sectionId, years) {
  const config = SECTION_COMPARISON_FIELDS[sectionId];
  if (!config || years.length === 0) return [];

  const isGrouped = Boolean(config.groups);

  const identityCols = [
    {
      colId:      `cmp::${sectionId}::identity::hei_code`,
      headerName: 'HEI Code',
      field:      'hei_code',
      width:      120,
      pinned:     'left',
      filter:     'agTextColumnFilter',
      cellStyle:  { fontWeight: '500' },
    },
    {
      colId:      `cmp::${sectionId}::identity::hei_name`,
      headerName: 'Name of HEI',
      field:      'hei_name',
      flex:       1,
      minWidth:   240,
      pinned:     'left',
      filter:     'agTextColumnFilter',
      cellStyle:  { fontWeight: '500' },
    },
    {
      colId:      `cmp::${sectionId}::identity::hei_type`,
      headerName: 'Type',
      field:      'hei_type',
      width:      90,
      pinned:     'left',
      filter:     'agTextColumnFilter',
      cellStyle:  { textAlign: 'center' },
    },
  ];

  const dataCols = [];

  for (let i = 0; i < years.length; i++) {
    const year = years[i];

    dataCols.push(
      isGrouped
        ? buildGroupedYearGroup(sectionId, year, config.groups)
        : buildFlatYearGroup(sectionId, year, config.fields)
    );

    if (i < years.length - 1) {
      const nextYear = years[i + 1];
      const deltaGroup = isGrouped
        ? buildGroupedDeltaGroup(sectionId, year, nextYear, config.groups)
        : buildFlatDeltaGroup(sectionId, year, nextYear, config.fields);

      if (deltaGroup) dataCols.push(deltaGroup);
    }
  }

  return [...identityCols, ...dataCols];
}

// ─────────────────────────────────────────────────────────────────────────────
// Flat section helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildFlatYearGroup(sectionId, year, fields) {
  return {
    groupId:     `cmp::${sectionId}::year::${year}`,
    headerName:  year,
    headerClass: 'year-group-header',
    children:    fields.map((f) => buildLeafCol(sectionId, year, f)),
  };
}

function buildFlatDeltaGroup(sectionId, yearA, yearB, fields) {
  const numericFields = fields.filter((f) => f.type === 'numeric');
  if (numericFields.length === 0) return null;

  return {
    groupId:     `cmp::${sectionId}::delta::${yearA}::${yearB}`,
    headerName:  `Δ ${yearA} → ${yearB}`,
    headerClass: 'delta-group-header',
    children:    numericFields.map((f) => buildDeltaLeafCol(sectionId, yearA, yearB, f)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Grouped section helpers
// NOTE: sub-groups use plain { headerName, children } — NO groupId.
// This matches the pattern used by single-year configs (healthConfig.jsx, etc.)
// which render correctly. Adding groupId to inner groups in AG Grid 35 breaks
// intermediate header rendering.
// ─────────────────────────────────────────────────────────────────────────────

function buildGroupedYearGroup(sectionId, year, groups) {
  return {
    groupId:     `cmp::${sectionId}::year::${year}`,
    headerName:  year,
    headerClass: 'year-group-header',
    children: groups.map((group) => ({
      // NO groupId here — plain headerName+children matches single-year pattern
      headerName: group.groupLabel,
      children:   group.fields.map((f) => buildLeafCol(sectionId, year, f)),
    })),
  };
}

function buildGroupedDeltaGroup(sectionId, yearA, yearB, groups) {
  const deltaSubGroups = groups
    .map((group) => {
      const numericFields = group.fields.filter((f) => f.type === 'numeric');
      if (numericFields.length === 0) return null;
      return {
        // NO groupId — plain headerName+children
        headerName: group.groupLabel,
        children:   numericFields.map((f) => buildDeltaLeafCol(sectionId, yearA, yearB, f)),
      };
    })
    .filter(Boolean);

  if (deltaSubGroups.length === 0) return null;

  return {
    groupId:     `cmp::${sectionId}::delta::${yearA}::${yearB}`,
    headerName:  `Δ ${yearA} → ${yearB}`,
    headerClass: 'delta-group-header',
    children:    deltaSubGroups,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaf builders
// ─────────────────────────────────────────────────────────────────────────────

function buildLeafCol(sectionId, year, fieldDef) {
  const { field, label, type } = fieldDef;

  const base = {
    colId:      `cmp::${sectionId}::${year}::${field}`,
    headerName: label,
    field:      `${year}::${field}`,
    width:      130,
    filter:     type === 'numeric' ? 'agNumberColumnFilter' : 'agTextColumnFilter',
    cellStyle:  type === 'numeric'
      ? { textAlign: 'right' }
      : { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  };

  if (type === 'numeric') {
    return {
      ...base,
      cellRenderer: (params) => {
        const v = params.value;
        if (v === null || v === undefined) return <span style={{ color: '#9ca3af' }}>—</span>;
        return <span>{Number(v).toLocaleString()}</span>;
      },
    };
  }

  if (type === 'boolean') {
    return {
      ...base,
      cellRenderer: (params) => {
        const v = params.value;
        if (v === null || v === undefined) return <span style={{ color: '#9ca3af' }}>—</span>;
        if (v === true)  return <span style={{ color: '#16a34a', fontWeight: 600 }}>Yes</span>;
        if (v === false) return <span style={{ color: '#dc2626', fontWeight: 600 }}>No</span>;
        return <span style={{ color: '#9ca3af' }}>—</span>;
      },
    };
  }

  // text
  return {
    ...base,
    cellRenderer: (params) => {
      const v = params.value;
      if (v === null || v === undefined || v === '') return <span style={{ color: '#9ca3af' }}>—</span>;
      return <span>{v}</span>;
    },
  };
}

function buildDeltaLeafCol(sectionId, yearA, yearB, fieldDef) {
  const { field, label } = fieldDef;
  const prefixedA = `${yearA}::${field}`;
  const prefixedB = `${yearB}::${field}`;

  return {
    colId:       `cmp::delta::${sectionId}::${yearA}::${yearB}::${field}`,
    headerName:  label,
    valueGetter: (params) => {
      const a = params.data?.[prefixedA];
      const b = params.data?.[prefixedB];
      if (a === null || a === undefined || b === null || b === undefined) return null;
      return b - a;
    },
    width:     120,
    filter:    'agNumberColumnFilter',
    cellStyle: { textAlign: 'right' },
    cellRenderer: (params) => {
      const delta = params.value;
      if (delta === null || delta === undefined) {
        return <span style={{ color: '#9ca3af' }}>—</span>;
      }
      if (delta > 0) {
        return <span style={{ color: '#16a34a', fontWeight: 700 }}>▲ {delta.toLocaleString()}</span>;
      }
      if (delta < 0) {
        return <span style={{ color: '#dc2626', fontWeight: 700 }}>▼ {Math.abs(delta).toLocaleString()}</span>;
      }
      return <span style={{ color: '#6b7280' }}>= 0</span>;
    },
  };
}
