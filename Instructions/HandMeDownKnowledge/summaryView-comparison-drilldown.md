# SummaryView — Comparison Mode Drilldown (Personnel)

## Context
SummaryView supports single-year and multi-year comparison modes. Comparison mode uses a separate column-building pipeline (`comparisonUtils.jsx` + `comparisonConfig.js`) that is entirely independent from the single-year section configs (`personnelConfig.jsx`, `healthConfig.jsx`, etc.).

---

## Input
- `comparisonConfig.js` — field definitions per section for comparison mode. Each field entry drives whether a cell renders as a button or plain text via `clickable: true` + `categoryKey`.
- `comparisonUtils.jsx` — `buildLeafCol()` reads `clickable` and `categoryKey` from the field def. If both are present AND `onDrilldown` is a function, it renders a clickable button; otherwise a plain `<span>`.
- `SummaryView.jsx` — passes `openDrilldown` to `buildComparisonColumns()` only when `SECTION_DRILLDOWN_REGISTRY[activeSection]` exists.

## Process
`buildComparisonColumns` → `buildFlatYearGroup` / `buildGroupedYearGroup` → `buildLeafCol(sectionId, year, fieldDef, onDrilldown)`. Clickability is decided entirely by `fieldDef.clickable && fieldDef.categoryKey && typeof onDrilldown === 'function'`.

## Output
- Non-zero clickable cell: blue/yellow underlined button, label `N →`, fires `openDrilldown(categoryKey, heiId, heiName, count, year)`.
- Zero clickable cell: gray muted button, label `0 +`, tooltip says "assign records into this category" — matches single-year `CountCell` behavior exactly.
- Non-clickable cell: plain `<span>`.

---

## Relevant Files

| File | Role |
|------|------|
| `resources/js/Config/summaryView/comparisonConfig.js` | Field definitions for comparison mode — source of truth for clickability |
| `resources/js/Config/summaryView/comparisonUtils.jsx` | Builds AG Grid columnDefs; `buildLeafCol` controls click rendering |
| `resources/js/Config/summaryView/personnelConfig.jsx` | Single-year Personnel columns — reference for expected clickable behavior |
| `resources/js/Config/summaryView/summaryConfig.js` | `SECTION_DRILLDOWN_REGISTRY` — controls which sections receive `onDrilldown` |
| `resources/js/Pages/Admin/SummaryView.jsx` | `openDrilldown` callback; `columnDefs` useMemo passes drilldown to comparison builder |

---

## Key Discoveries

- **Comparison and single-year column pipelines are completely separate.** Changes to `personnelConfig.jsx` have zero effect in comparison mode. Any clickability must be explicitly declared in `comparisonConfig.js`.
- `openDrilldown` in `SummaryView.jsx` is a stable callback (no deps, reads `primaryYear` via ref). In comparison mode, the explicit `year` param passed from `buildLeafCol` overrides the ref — so the modal always fetches the correct clicked year.
- Zero-click behavior is intentional: clicking `0 +` redirects to `category: 'total'` fetch with `zeroTargetCategory` set, opening the modal in "assign into this category" mode. This is not a bug.
- `categoryKey` for `1B-Personnel` individual fields must match the raw field name (e.g. `physician`, `nurse`) because the backend `fetchPath` uses it directly as the URL segment: `/admin/summary/personnel/{heiId}/{category}/evidence`.
- `total_personnel` uses `categoryKey: 'total'` (not `total_personnel`) — the backend uses `total` as the special aggregate key.

---

## Decisions Made

- **All 21 `1B-Personnel` fields in `comparisonConfig.js` marked `clickable: true`** with `categoryKey` matching the field name. Previously only `total_personnel` was clickable — all individual category columns were dead in comparison mode.
- **Zero-value cells in comparison mode render `0 +`** (gray, no underline) matching single-year `CountCell` style. Non-zero renders `N →` (blue/yellow, underlined). Distinction communicates "assign" vs "view" intent to the user.

---

## Attempted Solutions / Dead Ends

- None for this session. Root cause was identified directly from config inspection — no wrong paths taken.

---

## To Be Fixed Soon

_(None unresolved at end of session.)_
