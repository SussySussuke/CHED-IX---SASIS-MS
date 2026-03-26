# HEI Dashboard — Entrance Animations & Skeleton

## Input
- Dashboard rendered all sections statically with no entrance animation — visually flat on load.
- `DeadlineAlert` progress bar had no fill animation; color was hardcoded blue regardless of deadline status; percentage counter was static.
- `NeedHelp` skeleton was three generic pulse bars — did not mirror the real card layout.
- No skeleton existed for any prop-fed component (all data arrives via Inertia props, so skeletons only apply to `NeedHelp` which fetches via axios post-mount).

## Process
1. Added `animate-enter` keyframe to `tailwind.config.js` — compositor-only (`transform` + `opacity`), spring easing (`cubic-bezier(0.22, 1, 0.36, 1)`), 0.45s duration.
2. Wrapped each dashboard section in `AnimatedSection` in `Dashboard.jsx` with staggered `animationDelay` (0 / 60 / 120 / 180 / 240 / 300 / 360ms top-to-bottom). `className` prop forwarded so grid column spans (`lg:col-span-2`) are not broken by the wrapper div.
3. `DashboardStats` stat cards stagger individually (0 / 60 / 120ms) via `style` prop passed through `StatCard`'s existing `style` prop.
4. `SubmissionChecklist` items stagger at `index * 30ms`, capped at 600ms so long lists don't drag.
5. `RecentActivity` rows stagger at `index * 60ms`.
6. `DeadlineAlert` progress bar: `requestAnimationFrame` loop drives `displayWidth` state from 0 → `progressPercentage` using `easeOutQuad` (`t * (2 - t)`) over 1540ms. Fires on every mount (reset in `useEffect`). At 100%, `isCelebrating` flips to `true` and `canvas-confetti` fires two-cannon burst (bottom-left angle 60°, bottom-right angle 120°, 60 particles each).
7. Bar color, card background, icon, and percentage text all derived from a single `STATUS_STYLES` lookup keyed by `statusKey` (`complete` / `overdue` / `warning` / `normal`) — consistent from frame one, no mid-animation color change.
8. Green snap at 100%: `isCelebrating` switches `statusKey` to `complete` instantly — no CSS transition on the color change, intentional.
9. `NeedHelp` skeleton rebuilt to mirror exact layout: header icon + title, subtitle line, contact name, address row (icon + label + value), phone row, email row — all proportionally sized pulse bars. Real card gains `animate-enter` on reveal.

## Output
- `tailwind.config.js` — added `animate-enter` keyframe; removed dead `confetti-fall` keyframe (replaced by `canvas-confetti`).
- `resources/js/Pages/HEI/Dashboard.jsx` — `AnimatedSection` wrapper with stagger delays.
- `resources/js/Components/HEI/DeadlineAlert.jsx` — RAF fill animation, `easeOutQuad`, `canvas-confetti` burst, `STATUS_STYLES` lookup.
- `resources/js/Components/HEI/DashboardStats.jsx` — per-card stagger via `style` prop.
- `resources/js/Components/HEI/SubmissionChecklist.jsx` — per-item stagger, capped at 600ms.
- `resources/js/Components/HEI/RecentActivity.jsx` — per-row stagger.
- `resources/js/Components/HEI/NeedHelp.jsx` — `NeedHelpSkeleton` component mirrors real layout.

## Relevant Files
- `tailwind.config.js`
- `resources/js/Pages/HEI/Dashboard.jsx`
- `resources/js/Components/HEI/DeadlineAlert.jsx`
- `resources/js/Components/HEI/DashboardStats.jsx`
- `resources/js/Components/HEI/SubmissionChecklist.jsx`
- `resources/js/Components/HEI/RecentActivity.jsx`
- `resources/js/Components/HEI/NeedHelp.jsx`
- `resources/js/Components/Widgets/StatCard.jsx` — has existing `animate-fade-up` and accepts `style` prop; not modified.

## Key Discoveries
- Inertia delivers all dashboard data synchronously as props — skeletons are only meaningful for `NeedHelp` (the one component that fetches post-mount via axios). Every other component has real data on first render.
- CSS `background-image` (gradients) is not transitionable per spec — cross-fading gradients requires two overlapping divs with `opacity` transitions, not `transition-colors` on a single div.
- Tailwind class swaps (e.g. `bg-blue-50` → `bg-green-50`) do not trigger `transition-colors` — the browser sees new rules, not a value change. `transition-all` on the wrapper is required for background-color to interpolate.
- `AnimatedSection` must forward a `className` prop — wrapping grid children in a plain div without it breaks `lg:col-span-2` since the span must be a direct child of the grid container.
- `animate-enter` on `NeedHelp`'s real card and `AnimatedSection` in `Dashboard.jsx` would double-animate if both were applied — `NeedHelp` only applies `animate-enter` to its own root div after the axios fetch resolves, which is after the page-level stagger has already completed.

## Decisions Made
- Used `canvas-confetti` (raw package, not `react-canvas-confetti`) — imperative fire-once call is simpler and avoids React wrapper indirection.
- Bar color matches deadline status from frame one — no red→blue mid-fill color animation. Consistent and predictable.
- Green at 100% is an instant snap, not a transition — deliberate, feels like a reward trigger.
- Stagger cap of 600ms on checklist items — prevents long lists from feeling like a loading ceremony.
- `easeOutQuad` chosen over linear or `easeInOut` — fast initial movement reads as "filling up" rather than dragging.
