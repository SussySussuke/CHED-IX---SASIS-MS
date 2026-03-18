# HEI About Page

## Feature
Static informational page accessible to HEI users explaining CHED, the purpose of the SASIS system, and providing a contact channel.

---

## Input
- HEI user navigates to `/hei/about` via sidebar
- User clicks "Contact CHED" button

## Process
- Route renders `HEI/About` Inertia view (no controller — static content, closure route)
- "Contact CHED" button opens `Modal` wrapping `NeedHelp`, which fetches `/api/ched-contacts` via axios on open

## Output
- Centered page with four informational sections (CHED overview, system purpose, data use, data handling)
- Modal showing live CHED contact details (name, address, phone, email) with carousel if multiple contacts exist

---

## Relevant Files
- `routes/web.php` — closure route `GET /hei/about` named `hei.about`, inside `role:hei` middleware group
- `resources/js/Layouts/HEILayout.jsx` — "About" added as third sidebar link with `IoInformationCircle`
- `resources/js/Pages/HEI/About.jsx` — page component (created)
- `resources/js/Components/HEI/NeedHelp.jsx` — reused as-is; fetches contacts on `open=true`
- `resources/js/Components/Common/Modal.jsx` — reused as-is; `size="md"`

---

## Key Discoveries
- `NeedHelp` already handles its own data fetching via `/api/ched-contacts` — no new API needed
- `showHeader={false}` passed to `HEILayout` — About page has no academic year context so the year-selector header is suppressed
- `react-icons/io5` has no `-Outline` suffix variants — only filled and `-Sharp`; using bare names (e.g. `IoSchool`, not `IoSchoolOutline`)

## Decisions Made
- Closure route (no controller) — consistent with existing pattern for static Inertia pages (`SuperAdmin/Dashboard`, `HEI/Notifications`)
- About link has no `yearParam` appended — intentional, page is year-agnostic
- Content centered via `flex justify-center` + `max-w-2xl` wrapper inside the layout's `p-6` container

---

## Dead Ends
- Initially misbuilt as a sidebar info panel pulling HEI model data — scrapped entirely, wrong intent
- `IoSchoolOutline` etc. used in first write — caused silent render failure; corrected to valid io5 names
