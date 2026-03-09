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
 *
 * ─── Zero-total inert state ──────────────────────────────────────────────────
 * When the section total for an HEI in a given year is 0, ALL clickable cells
 * for that row/year are rendered as inert plain text (no button, no cursor).
 * This is semantically distinct from a category-zero (0 +) where the total IS
 * non-zero but this specific category has no records yet — that state still
 * shows the clickable "0 +" button because assigning is meaningful.
 * Total-zero means no submissions exist at all; nothing can be drilled into or
 * assigned. Rendering a button there is a false affordance.
 *
 * Implementation: each section config has at most one field with categoryKey
 * === 'total'. That field's prefixed row key (`${year}::${field}`) is resolved
 * once per year group and passed down as `totalField` to buildLeafCol, which
 * reads it from params.data at render time.
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
 *
 * options.showDelta  boolean (default true) — when false, all Δ columns are
 * omitted from the returned columnDefs. Applies to both flat and grouped sections.
 */
export function buildComparisonColumns(sectionId, years, onDrilldown = null, { showDelta = true } = {}) {
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

    if (showDelta && i < years.length - 1) {
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
  // Resolve the prefixed total field key for this year so buildLeafCol can
  // check whether the entire section is empty for a given HEI/year row.
  const totalFieldDef = fields.find((f) => f.categoryKey === 'total');
  const totalField    = totalFieldDef ? `${year}::${totalFieldDef.field}` : null;

  return {
    groupId:     `cmp::${sectionId}::year::${year}`,
    headerName:  year,
    headerClass: 'year-group-header',
    children:    fields.map((f) => buildLeafCol(sectionId, year, f, onDrilldown, totalField)),
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

  // Resolve the prefixed total field key across all groups for this section.
  // Grouped sections (Health, Guidance, etc.) keep the 'total' field in the
  // last group ("Total"). We scan all groups to find it.
  const allGroupFields  = groups.flatMap((g) => g.fields);
  const totalFieldDef   = allGroupFields.find((f) => f.categoryKey === 'total');
  const totalField      = totalFieldDef ? `${year}::${totalFieldDef.field}` : null;

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
        children:   group.fields.map((f) => buildLeafCol(sectionId, year, f, onDrilldown, totalField)),
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

/**
 * totalField — prefixed row key for the section's aggregate total, e.g.
 * "2024-2025::total_personnel". When provided, a row whose total is 0
 * renders ALL clickable cells as inert plain text — there is nothing to drill
 * into or assign. This is distinct from a category-zero (total > 0, this
 * category = 0) which still shows the actionable "0 +" button.
 */
function buildLeafCol(sectionId, year, fieldDef, onDrilldown, totalField = null) {
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
          const isZero     = v === 0;
          // Section total for this HEI in this year. When the total is 0 the
          // HEI has no submissions at all — every cell is inert regardless of
          // whether it would normally show "0 +" or a count.
          // sectionTotal is null  → no totalField configured for this section (no guard)
          // sectionTotal is 0     → backend returned explicit zero (submitted but empty)
          // sectionTotal is undef → year is missing for this HEI (__missing path in
          //                         buildComparisonRows); treat as empty too.
          const rawTotal     = totalField != null ? params.data?.[totalField] : null;
          const sectionTotal = totalField != null ? (rawTotal ?? null) : null;
          const sectionEmpty = sectionTotal === 0 || (totalField != null && rawTotal === undefined);

          if (isZero && sectionEmpty) {
            // Total-zero: the whole section is unsubmitted. Render inert — no
            // button, no cursor, no false affordance. A plain dash communicates
            // "nothing here" without implying the user can do something.
            return <span style={{ color: '#d1d5db' }}>—</span>;
          }

          return (
            <button
              style={{
                color: isZero ? '#9ca3af' : colour,
                fontWeight: isZero ? 400 : 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px',
                textDecoration: isZero ? 'none' : 'underline',
                fontSize: 'inherit',
              }}
              title={isZero ? 'No records yet — click to open and assign records into this category' : `Click to view records for ${year}`}
              onClick={() => onDrilldown(categoryKey, params.data?.hei_id, params.data?.hei_name, v, year)}
            >
              {isZero ? '0 +' : `${Number(v).toLocaleString()} →`}
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
