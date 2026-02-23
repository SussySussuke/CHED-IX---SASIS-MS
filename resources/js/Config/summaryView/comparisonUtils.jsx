/**
 * comparisonUtils.jsx
 *
 * Pure utility functions for multi-year comparison mode in SummaryView.
 *
 * ─── Column structure ───────────────────────────────────────────────────────
 *
 * Sections with flat `fields`:
 *   [Name of HEI pinned]
 *   [Year A]  →  flat leaf cols
 *   [Δ A→B]   →  flat delta leaf cols (numeric only)
 *   [Year B]  →  flat leaf cols
 *
 * Sections with `groups` (Health, Guidance, CareerJob, InfoOrientation):
 *   [Name of HEI pinned]
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
 * - Inner sub-groups MUST have year-scoped groupIds. Without them, AG Grid v35
 *   merges identical sub-group headerNames (same label across different years)
 *   and collapses the intermediate header row.
 * - Top-level year/delta groups also use groupId (prevents cross-section collisions).
 * - marryChildren goes on top-level year/delta groups only, not the sub-groups.
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

/**
 * onDrilldown(category, heiId, heiName, count, year) — fired when a clickable
 * numeric cell is clicked in comparison mode. Only wired for fields with
 * clickable:true + categoryKey set in comparisonConfig.js.
 * Delta columns are NEVER clickable.
 */
export function buildComparisonColumns(sectionId, years, onDrilldown = null) {
  const config = SECTION_COMPARISON_FIELDS[sectionId];
  if (!config || years.length === 0) return [];

  const isGrouped = Boolean(config.groups);

  const identityCols = [
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
  ];

  const dataCols = [];

  for (let i = 0; i < years.length; i++) {
    const year = years[i];

    dataCols.push(
      isGrouped
        ? buildGroupedYearGroup(sectionId, year, config.groups, onDrilldown)
        : buildFlatYearGroup(sectionId, year, config.fields, onDrilldown)
    );

    if (i < years.length - 1) {
      const nextYear = years[i + 1];
      // Delta columns are always read-only — no onDrilldown passed
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

function buildFlatYearGroup(sectionId, year, fields, onDrilldown) {
  return {
    groupId:     `cmp::${sectionId}::year::${year}`,
    headerName:  year,
    headerClass: 'year-group-header',
    children:    fields.map((f) => buildLeafCol(sectionId, year, f, onDrilldown)),
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
// NOTE: sub-groups REQUIRE a year-scoped groupId in AG Grid v35.
// When multiple year top-level groups share identical sub-group headerNames
// (e.g. "Annual Medical Check-up/Consultation"), AG Grid merges them across
// year columns — collapsing the intermediate header row entirely.
// The fix: groupId must include the year slug so each sub-group is unique.
// marryChildren goes on the TOP-LEVEL year group, not the sub-groups.
// ─────────────────────────────────────────────────────────────────────────────

function buildGroupedYearGroup(sectionId, year, groups, onDrilldown) {
  // slugify year label for use in groupId (e.g. "2024-2025" stays as-is)
  const yearSlug = year.replace(/\s+/g, '_');

  return {
    groupId:       `cmp::${sectionId}::year::${yearSlug}`,
    headerName:    year,
    headerClass:   'year-group-header',
    marryChildren: true, // keep the year header from splitting across column blocks
    children: groups.map((group) => {
      // Each sub-group MUST have a year-scoped groupId.
      // Without it, AG Grid v35 sees identical sub-group headerNames (e.g.
      // "Annual Medical Check-up/Consultation") across multiple year columns
      // and tries to span/merge them — collapsing the intermediate header row.
      const subGroupSlug = group.groupLabel.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
      return {
        groupId:    `cmp::${sectionId}::year::${yearSlug}::${subGroupSlug}`,
        headerName: group.groupLabel,
        children:   group.fields.map((f) => buildLeafCol(sectionId, year, f, onDrilldown)),
      };
    }),
  };
}

function buildGroupedDeltaGroup(sectionId, yearA, yearB, groups) {
  const yearASlug = yearA.replace(/\s+/g, '_');
  const yearBSlug = yearB.replace(/\s+/g, '_');

  const deltaSubGroups = groups
    .map((group) => {
      const numericFields = group.fields.filter((f) => f.type === 'numeric');
      if (numericFields.length === 0) return null;
      const subGroupSlug = group.groupLabel.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
      return {
        groupId:    `cmp::${sectionId}::delta::${yearASlug}::${yearBSlug}::${subGroupSlug}`,
        headerName: group.groupLabel,
        children:   numericFields.map((f) => buildDeltaLeafCol(sectionId, yearA, yearB, f)),
      };
    })
    .filter(Boolean);

  if (deltaSubGroups.length === 0) return null;

  return {
    groupId:       `cmp::${sectionId}::delta::${yearASlug}::${yearBSlug}`,
    headerName:    `Δ ${yearA} → ${yearB}`,
    headerClass:   'delta-group-header',
    marryChildren: true,
    children:      deltaSubGroups,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaf builders
// ─────────────────────────────────────────────────────────────────────────────

function buildLeafCol(sectionId, year, fieldDef, onDrilldown) {
  const { field, label, type, clickable, categoryKey } = fieldDef;
  const isClickable = clickable && categoryKey && typeof onDrilldown === 'function';

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

        if (isClickable) {
          const colour = categoryKey === 'uncategorized' || categoryKey === 'others'
            ? '#ca8a04'  // yellow for misc categories
            : '#2563eb'; // blue for normal categories
          return (
            <button
              style={{
                color: colour,
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px',
                textDecoration: 'underline',
                fontSize: 'inherit',
              }}
              title={`Click to view records for ${year}`}
              onClick={() => onDrilldown(categoryKey, params.data?.hei_id, params.data?.hei_name, v, year)}
            >
              {Number(v).toLocaleString()} →
            </button>
          );
        }

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
