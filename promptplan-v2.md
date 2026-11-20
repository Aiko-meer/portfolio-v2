# ZEDVORA — Motion Upgrade Plan v2

Revision of `promptplan.md.txt`, written as a **delta spec against the existing project**, not a
rebuild brief. The original file stays untouched. This document supersedes it.

Repo: `C:\Users\User\Documents\zedvora`
Do not touch `C:\Users\User\Documents\portfolio` — that is a separate Next.js experiment.

---

## 0. Operating rules

- **Stack:** Vite 8, vanilla ES modules. No framework, no Laravel, no Mix. GSAP 3.15 + ScrollTrigger,
  Lenis 1.3, Three 0.187, sharp (asset builds only). Output is static `dist/`.
- **Commands:** `npm run dev` (127.0.0.1:5173), `npm run build`, `npm run preview`,
  `npm run assets`, `node qa/run-qa.mjs`.
- **Approval gate:** finish the phase, then stop. Report files touched, bundle sizes, screenshots,
  anything skipped — and wait. Do not start the next phase unasked.
- **Dependencies:** no new npm packages without listing them and getting approval first.
- **Scope:** change only what the work order names. Do not "improve" other sections in passing.

---

## 1. Ground truth — what already exists

Do not rebuild these. Extend them.

| Concern | Where | State |
|---|---|---|
| Hero 3D | `src/gl/scene.js`, `hero-object.js`, `particles.js` | Metal icosahedron, 2 torus rings, shards, 520/180 particles, RoomEnvironment, pointer camera, scroll float, DPR cap 1.5/1.25, offscreen pause, poster fallback. **Done.** |
| Boot order | `src/main.js` | CSS → content → motion → lazy `import('./gl/scene.js')` on idle. **Done.** |
| Smooth scroll | `src/motion/setup.js` | Lenis wired to gsap ticker + `ScrollTrigger.update`; off under reduced motion. **Done.** |
| Reveals | `src/motion/reveals.js` | One 26 px rise+fade for every `[data-reveal]`. **This is the main thing to replace (E).** |
| Services | `src/ui/services.js`, `src/data/services.js` | 4 inline SVG visuals (browser, blueprint, network, inventory), ±8° pointer tilt on >900 px. **Partial.** |
| Projects | `src/ui/project-showcase.js` | CSS device mockups with skeleton UIs (monitor, laptop, browser, tablet), scrub rotateY ±7°. **Partial**; data is still four demo rows — real case studies are work order F. |
| Process | `src/motion/process.js` + CSS | Rail fill via CSS var, one-time activation. **No active-step expansion.** |
| Nav / form / a11y | `src/ui/nav.js`, `form.js`, `index.html` | Focus trap, scroll spy, skip link, labels/errors, honeypot. **Done.** |
| Assets / fonts | `public/assets`, `public/fonts`, `scripts/build-assets.mjs` | AVIF/WebP sets, local woff2, sharp pipeline. **Done.** |
| QA | `qa/run-qa.mjs` | Playwright (channel chrome, SwiftShader), 4 viewports, console capture → `qa/shots`. **Done.** |

**Measured baseline (2026-11-20):** app JS 56.4 KB gzip, lazy Three chunk 133.0 KB gzip.

---

## 2. Brand and motion tokens — use these, do not invent

From `src/styles/tokens.css`:

- Background `#070709`, elevated `#0b0b0e`, surface `#101014`
- Text `#f4f4f6`, dim `#a8a8b2`, faint `#767681`
- Crimson `#d9192b`, bright `#ff3046`, ink `#ff6b7a`, deep `#7d0d18`
- Display: Space Grotesk; body: Inter (both local woff2)
- Ease out `cubic-bezier(.16,1,.3,1)`; ease in-out `cubic-bezier(.65,0,.35,1)`
- Radii 10/16/24 px; shell `min(1200px, 100vw - 72px)`

**Contrast rule:** `#d9192b` on `#070709` is ≈3.9:1. Use crimson for large text (≥24 px), borders,
and glows only. Use `#ff6b7a` for small text. The current markup already follows this — preserve it.

**Timing:** micro 150–250 ms, UI 250–450 ms, reveals 600–1000 ms, cinematic 1000–1600 ms.
Stagger 60–90 ms. Animate only `transform`, `opacity`, `clip-path`, CSS vars.

---

## 3. Letter map — there are five concepts, not four

The reference letters map to sections like this. Label them this way in code comments and reports:

| Letter | Section | Current coverage |
|---|---|---|
| A | Hero — cinematic 3D open | ~90% (polish only) |
| B | Services — 3D floating objects | ~60% (2D layers) |
| C | Projects — cinematic showcase | ~55% (tilt only, no depth travel) |
| D | Process — animated timeline | ~70% (no active expansion) |
| E | Transitions between sections | ~30% (one generic reveal) |

The reference frames are **mood, not render targets**. Match the interaction and depth, not the
literal chrome-and-red look.

---

## 4. Work orders

### A — Hero polish (small, Phase 1)

Files: `src/gl/scene.js`, `src/gl/hero-object.js`, `src/styles/sections.css`.

1. Add a slow energy pulse **behind** the object: a CSS radial gradient in `.hero__scene`,
   opacity 0.18 → 0.30 over 6–8 s, paused when the hero leaves the viewport (reuse the existing
   IntersectionObserver signal with a class toggle).
2. Give the two torus rings independent opacity drift (±15–20%, different periods) so they stop
   reading as static circles. Animate material opacity, not geometry.
3. Optional, only if it looks premium: one 900 ms light sweep across the logo mark on load
   (gradient overlay clipped to the mark box, once per session). Skip if it reads as cheap.
4. Do not add a model, HDRI, texture, post-processing, second canvas, or more particles.

**Acceptance:** bundle size unchanged; still 60 fps; reduced motion shows the static poster with no
pulse and no sweep.

### B — Services depth (Phase 2)

Files: `src/ui/services.js`, `src/styles/sections.css`, `src/data/services.js` (read-only).

1. Split each SVG into 2–3 depth layers (glow / object / grid) inside a shared wrapper. On pointer
   move, translate layers 4–10 px at different ratios and keep tilt ≤ 6°.
2. Hover: crimson light layer intensifies, content (title + points) rises 6 px with 40 ms stagger.
   If a border glow already exists on `.service-card__visual::after`, tune it — do not stack a
   second sweep on top.
3. Keep the four object concepts — they already match the reference. No WebGL per card.
4. Custom cursor: skip by default. If attempted, only on `pointer: fine`, never hide the native
   cursor over text, inputs, or buttons, and remove it under reduced motion.
5. Touch and <900 px: no pointer parallax, no custom cursor. Extend the existing guard.

**Acceptance:** no layout shift on hover; no dropped frames with 4 cards visible at 768 px; card
content still readable and selectable.

### C — Projects showcase depth (Phase 3)

File: `src/ui/project-showcase.js` (+ CSS in `src/styles/sections.css`).

1. Extend the existing scrub: keep y 46→0 and rotateY ±7→0, add scale 0.96→1 and a modest Z push
   (`translateZ` via a perspective wrapper or `transformPerspective`) so screens travel forward as
   they enter.
2. Add a media reveal: `clip-path: inset(0 0 100% 0)` → `inset(0)` (or a directional wipe)
   synchronized to the scrub, applied to `.project__media` only — never to the text block.
3. Inner screen parallax: shift `.device__screen` content 6–12 px opposite the scroll. Transform
   only, no new DOM.
4. Keep the CSS device mockups and skeleton UIs as the fallback/loading state. Real screenshots enter only through
   work order F; rows with no media keep the skeletons.
5. Keep alternating `project--flip` direction.

**Acceptance:** zero CLS (transform/clip only); no horizontal overflow at 320 px; scrub is
continuous with no jumps at section boundaries; reduced motion renders static.

### D — Process expansion (Phase 2)

File: `src/motion/process.js` + process CSS in `src/styles/sections.css`.

1. Active step expands: scale 1.0 → 1.035, node ring pulse, number color to `--crimson-ink`.
   Drive it from the existing `is-active` class — no new observers.
2. Expansion must use transform only so neighbors never reflow.
3. Verify the list is vertical below 900 px and that the rail fill tracks vertically; the fill
   already uses a CSS var, so confirm rather than rebuild.
4. Keep the one-time activation (stability beats reversibility here).

**Acceptance:** six steps; active state obvious at a glance; no reflow; reduced motion shows all
steps active (current behavior preserved).

### E — Section transitions (Phase 1, the real gap)

Replace the single reveal system with **three deliberate variants**, assigned per section — not one
custom animation per section.

1. `data-reveal="rise"` — default: 24–28 px rise + fade (the current feel).
2. `data-reveal="clip"` — work section header and media: clip-path wipe + 12 px rise.
3. `data-reveal="depth"` — services grid and about: scale 0.97 + fade, no Y movement.

Rules: one variant per section; stagger children 60–90 ms; duration 700–950 ms; ease
`var(--ease-out)`; cap concurrent tweens. Rewrite `src/motion/reveals.js` as a small factory with a
variant map, and set the attributes in `index.html`.

**Acceptance:** adjacent sections no longer look identical; reduced-motion path unchanged; nothing
stays invisible if JS fails (the `js-motion` / `js-motion-fallback` fallback must still work).

### Cross-cutting — Nav (verify only)

Hover indicator, scrolled glass state, and the animated mobile menu already exist. Add only a
crimson active-link underline if one is missing. Do not restyle the nav.

### F — Real project showcase (Phase 4, content work order — not a sixth motion concept)

Replace the four demo rows with three real systems: **UZ Social Media Report**, **UCO-TMS**, and
**Budget Desk**. This is content, media, and one new interaction (a case-study dialog). C's scrub,
flips, clip reveal, and inner parallax apply unchanged. No new dependencies, no page restructure.

Files: `src/data/projects.js`, `src/ui/project-showcase.js`, `src/styles/sections.css`, `index.html`,
`scripts/build-assets.mjs`; new source folder `assets/work/`, output in `public/assets/work/`.

**1. Data model (optional fields, guarded).** Keep `id, title, category, year, description, stack,
device`. Add optional `client`, `role`, `status` (`'client' | 'personal'`), `media {avif, webp, alt}`,
`highlights: string[]`, `caseStudy {problem, build: string[], outcome}`, `gallery {avif, webp, alt}[]`,
`demo {url, label, note}`, `video {src, poster, captions}`. The renderer must skip anything missing —
a row with no `media` keeps the skeleton screen. The "no data-shape changes" rule is lifted **only**
for these fields.

**2. Media pipeline.** Add `assets/work/` masters; extend `scripts/build-assets.mjs` to emit
1600×1000 and 800×500 AVIF (q≈50) + WebP (q≈80) cover crops into `public/assets/work/` (anchor `top`
for tall UI captures). Budgets: ≤220 KB at 1600, ≤90 KB at 800. Render inside the existing
`.device__screen`:

```html
<picture>
  <source type="image/avif" srcset="/assets/work/smr-dashboard-800.avif 800w, /assets/work/smr-dashboard-1600.avif 1600w" sizes="(min-width: 900px) 640px, 90vw" />
  <img src="/assets/work/smr-dashboard-1600.webp" width="1600" height="1000" loading="lazy" decoding="async" alt="…" />
</picture>
```

The skeleton stays behind the image as the placeholder; explicit dimensions keep CLS at zero. Keep
screenshots inside the device frame — no full-bleed raw images.

**3. Rows and order.** 1) UZ Social Media Report — monitor, live demo. 2) UCO-TMS — monitor, private
client system. 3) Budget Desk — laptop, personal project with tour video. Keep alternating
`project--flip`. Meta line: category · short client · year. Status chip: "Client system" /
"Personal project" — **no "Demo project" tag in this list**.

**4. Case-study dialog (native, no dependency).** One `<dialog id="case-study">` in `index.html` with
close button, title, meta, body, gallery, and actions. Each row gets a "Case study" button
(`aria-haspopup="dialog"`) that fills the dialog and calls `showModal()`. Esc, backdrop, and close
return focus to the trigger; body scroll is locked (`scrollbar-gutter: stable` on `html` to avoid a
shift). Animate opacity + 8 px translate only, 250–450 ms; instant under reduced motion. Never animate
height. Gallery: 2–4 thumbnails, `object-fit: cover`; clicking opens the full asset in a new tab (no
lightbox).

**5. Links.**
- **SMR:** "Live demo" → `https://uzsocmed.freehosting.dev/login`, with a viewer account note. Create a
  dedicated **viewer** account on the live database; never publish admin/encoder credentials.
- **UCO-TMS:** no public URL. Render a non-link chip "Private client system — walkthrough on request."
  No dead "View project" anchors.
- **Budget Desk:** local-only by design. "Watch the system tour" opens the dialog with
  `<video controls preload="none" playsinline poster>` plus `<track kind="captions">`. No autoplay.

**6. Section copy.** Replace "Demo builds. / Real engineering." and the demo-only lede. Suggested:
H2 "Real systems. / **Real engineering.**" — lede: "Three systems designed and built end to end — a
university analytics platform, an internal request desk, and a personal finance app. Client screens
are shown with permission and sanitized where needed." Eyebrow stays "02 — Selected work". Remove the
demo-tag branch from the renderer; if the concept builds are kept later, they belong in a separate
strip, not this list.

**7. Permission and sanitization (blocking).**
- Get written OK from UZ/UCO before publishing their screens. If refused, show fictitious seeded data
  and label the row "UI preview".
- No employee IDs, emails, student names, phone numbers, or real reference numbers. UCO screenshots use
  seeded users (`EMP-0001`, Juan Dela Cruz, etc.).
- SMR shows public-page captions and metrics; still crop or blur any personal data.
- Capture at 1440×900, DPR 1, clean browser profile, no bookmarks, extensions, or OS notifications.

**8. Acceptance.** Three real rows; no demo tag in the list; media loads without CLS; dialog is
keyboard/Esc/outside-click complete and returns focus; no dead links; video ≤12 MB with captions;
images within budget; reduced motion static; Lighthouse unchanged; every claim traceable to Appendix A5.

---

## 5. Performance budget

| Metric | Budget | Today |
|---|---|---|
| App JS | ≤ 70 KB gz | 56.4 KB |
| Lazy Three chunk | ≤ 140 KB gz | 133.0 KB |
| New dependencies | 0 | — |
| LCP (mobile 4G) | ≤ 2.5 s | measure |
| CLS | < 0.02 | measure |
| Frame rate | 60 fps desktop, ≥50 fps mid-range Android | verify |
| Hero canvas offscreen | paused | done |
| Work images | ≤ 220 KB at 1600, ≤ 90 KB at 800 | — |
| Case-study video | ≤ 12 MB + WebVTT captions | — |

No animated `filter: blur()` on large surfaces. No per-frame `getBoundingClientRect()` in rAF
loops. `will-change` only while an animation is active, removed after.

---

## 6. Accessibility — preserve what exists

- Skip link, focus trap, `aria-expanded`, live-region form status: keep.
- Contrast rule from §2 applies to every new glow, label, and underline.
- Any custom cursor must not trap focus or replace the caret over interactive elements.
- No animation may delay typing feedback or form validation messages.
- `prefers-reduced-motion`: no Lenis, no scrub, no pulse, no sweep, all content visible.

---

## 7. Content and launch blockers — do not fix silently

- `src/data/site.js`: `email` is `TODO_EMAIL`, all socials are `TODO_*`, `formEndpoint` is empty —
  the contact form cannot submit. Appendix B supplies the confirmed email and Facebook URL; GitHub and
  LinkedIn stay TODO. Decide form vs mailto: the page currently ships a form that silently fails.
- Personal copy: Appendix B reconciles `Documents/zed/informations.txt` with the live page. Live copy
  wins unless a change is approved; the info file adds facts (three years freelancing, social media
  work, MIT, services, skills) the page does not carry yet.
- `index.html`: `og:image` is relative; canonical and absolute domain are TODO.
- Projects: the four demo rows are replaced by the three real systems (work order F). The current
  heading ("Demo builds.") and lede ("Every entry below is a demo project") must change with them.
  Any demo build kept later lives in a separate concept strip and stays labeled — never mixed with
  client work.
- SMR gets a viewer-only demo account; the free-host JS challenge must be re-tested in incognito before
  the link goes live. If it blocks visitors, use "Live demo on request" plus the walkthrough video.
- UCO-TMS and Budget Desk have no public URL. Do not invent one; use the private-system chip and the
  tour video. UCO-TMS is an internal request/workflow system, not a student task manager — describe it
  accurately.
- Screenshots and video need a permission + sanitization pass (§F7) before publishing.
- The original plan's suggested headline ("Digital Solutions. Built Around Your Needs.") and
  service names conflict with live copy. **Live copy wins.** Do not rewrite it without approval.

Ask before inventing any of the above.

---

## 8. QA protocol

1. `npm run build`; record gzip sizes of app and Three chunks; compare against §5.
2. `npm run preview`; `node qa/run-qa.mjs`; confirm zero console errors and review screenshots at
   1440 / 1024 / 768 / 390.
3. Manual: tab through nav → cards → form; emulate reduced motion; check 320 px width; scroll to
   the footer and confirm no horizontal scrollbar.
4. Report: files touched, before/after sizes, screenshots, deviations, and anything skipped.

---

## 9. Phases — stop after each

**Phase 1 — Foundation:** reveal variants (E) + hero pulse and ring drift (A).
Exit: sections visibly differentiated; sizes within budget; no accessibility regression.

**Phase 2 — Services + process:** layered depth and hover (B), active-step expansion (D).
Exit: both work on desktop and touch; no reflow; tablet frame rate holds.

**Phase 3 — Projects + full QA:** depth travel, clip reveal, inner parallax (C); complete §8.
Exit: budget met, QA clean, launch blockers still listed (not silently patched).

**Phase 4 — Real case studies:** replace demo data, add the media pipeline, screenshots, dialog,
links and copy (F); run §8 again on desktop and mobile.
Exit: three real rows render with real media, no demo labels, dialog accessible, no dead links,
permissions recorded, media inside §5 budgets.

If a phase exceeds budget or breaks an acceptance item, stop and report — do not improvise.

---

## 10. Never do

- No React/Next/Laravel migration; ignore `Documents/portfolio`.
- No external 3D models, HDRIs, textures, or web fonts.
- No per-character text splitting or typewriter headline.
- No second smooth-scroll library; do not replace Lenis.
- No new npm dependency without approval.
- No rewriting copy or data shape beyond the optional fields defined in F; renderers must keep working
  when those fields are absent.
- No real employee IDs, emails, student names, or reference numbers in screenshots or demo accounts.
- No autoplaying case-study video, no video over 12 MB, no invented client metrics or usage numbers.
- No animating `width`, `height`, `top`, or `left`.
- No `display: none` for reveal states (content must exist for no-JS and crawlers).
- No changes to sections not named in a work order.

---

## Appendix A — Real project content pack (input for work order F)

Everything below is verified against the three repos (`smr-app`, `UCO-TMS`, `budget-app`) as of
2026-11-20. Fill only what the code and the client confirm; leave the marked TODOs until they are true.

### A1 — `src/data/projects.js`

```js
export const projects = [
  {
    id: 'smr',
    title: 'UZ Social Media Report',
    category: 'Analytics & reporting',
    client: 'Universidad de Zamboanga · University Communication Office',
    year: '2026',
    status: 'client',
    role: 'Sole developer — schema, import pipeline, UI, deployment',
    description:
      'Turns Meta Business Suite exports into a live dashboard, a filterable post explorer, and publishable monthly reports for the university Facebook page.',
    stack: ['Laravel 12', 'MySQL', 'Blade', 'Tailwind CSS', 'Chart.js', 'Alpine.js'],
    device: 'monitor',
    media: {
      avif: '/assets/work/smr-dashboard-1600.avif',
      webp: '/assets/work/smr-dashboard-1600.webp',
      alt: 'UZ Social Media Report dashboard: KPI cards, engagement trend and top posts'
    },
    highlights: [
      'Meta CSV import with column validation, per-row error logs and idempotent re-imports',
      'Views, viewers, engagement, link clicks, shares and earnings with CSV export',
      'Admin, encoder and viewer roles; monthly report draft → edit → publish'
    ],
    caseStudy: {
      problem:
        'The office works from Meta CSV exports; monthly performance and earnings needed one consistent, shared report.',
      build: [
        'CSV importer for post-level exports, matched on post + date so re-uploads refresh instead of duplicating',
        'Dashboard with views, viewers, engagement rate, shares, link clicks and earnings; trends, weekday and post-type breakdowns; page-health checks',
        'Post explorer with date, type and minimum-engagement filters, detail charts and CSV export',
        'Rule-based monthly summary that is generated, edited, then published; viewers only see published versions',
        'Meta payout statement (PDF) import plus manual entries, per-month totals and CSV export',
        'Role-based access with server-side authorization and a row-level upload history'
      ],
      outcome:
        'Month-end reporting and earnings live in one system, with a draft → publish workflow and access scoped by role.'
    },
    demo: {
      url: 'https://uzsocmed.freehosting.dev/login',
      label: 'Live demo',
      // TODO before publish: create a viewer-only account on the live DB and show its credentials here
      note: 'Viewer demo — credentials on request.'
    },
    video: null
  },
  {
    id: 'uco-tms',
    title: 'UCO-TMS',
    category: 'Request workflow',
    client: 'Universidad de Zamboanga · University Communication Office',
    year: '2026',
    status: 'client',
    role: 'Sole developer — schema, workflows, realtime notifications, UI',
    description:
      'A request desk for the communication office: five public service forms, reference-number tracking, and role-scoped production queues with live notifications.',
    stack: ['Laravel 12', 'Livewire 4', 'Tailwind CSS 4', 'Laravel Reverb', 'MySQL'],
    device: 'monitor',
    media: {
      avif: '/assets/work/uco-tms-dashboard-1600.avif',
      webp: '/assets/work/uco-tms-dashboard-1600.webp',
      alt: 'UCO-TMS social media queue with request cards, statuses and team navigation'
    },
    highlights: [
      'Five public request forms (social media, layout, production, trademark, soft copy) with rate limiting',
      'Reference-number tracking with lost-reference recovery',
      'Ten team queues across seven role types, with take/assign/update, sent/denied/done and CSV archives',
      'Per-account realtime notifications over Laravel Reverb'
    ],
    caseStudy: {
      problem:
        'Five communication services, one office: the system needed a single intake path, reference tracking and role-scoped queues so requestors and staff see the same status.',
      build: [
        'Public portal with five service forms, validated uploads, throttling and reference numbers',
        'Tracking page plus lost-reference recovery by email and last name',
        'Seven role types enforced by route middleware, with admin/superadmin override',
        'Ten queues: social media, photography, video, layout, production, publishing, UZ Post, UZ PR, soft copy, trademark',
        'Take, assign, update, mark sent / denied / done, and CSV archive exports per service',
        'Per-account notification feed broadcast over Reverb, plus admin user management'
      ],
      outcome:
        'Intake, assignment, status and archives sit in one system; requestors can check progress by reference number without messaging staff.'
    },
    demo: null,
    video: null
  },
  {
    id: 'budget-desk',
    title: 'Budget Desk',
    category: 'Personal finance',
    client: null,
    year: '2026',
    status: 'personal',
    role: 'Sole developer — product spec, data model, UI, tests',
    description:
      'A local-only budget app built around the 15th/end-of-month pay cycle: bills, savings goals and safe-to-spend, with every balance computed on read.',
    stack: ['Laravel 12', 'Livewire 3', 'Tailwind CSS 4', 'Chart.js'],
    device: 'laptop',
    media: {
      avif: '/assets/work/budget-desk-dashboard-1600.avif',
      webp: '/assets/work/budget-desk-dashboard-1600.webp',
      alt: 'Budget Desk dashboard: current pay period, safe-to-spend, accounts and cashflow chart'
    },
    highlights: [
      'Pay-period engine covering 15th/end-of-month, short months and leap years',
      'Savings target, bills due, safe-to-spend and a daily guide per paycheck',
      'Budgets, goals, tagged transfers and six-month cashflow/savings reports',
      '26 PHPUnit tests / 114 assertions and a documented spec'
    ],
    caseStudy: {
      problem:
        'A monthly budget model does not fit a 15th/end-of-month pay cycle, where bills and savings have to be split across two paychecks.',
      build: [
        'Pay-period service: 15th → 30/31 and end of month → 14th, with due-day clamping and leap-year handling',
        'Per-paycheck savings target (default 20% of net, rounded to ₱100), bills due, safe-to-spend and a daily guide',
        'Bills become linked expenses when paid; budgets copy forward; goals accept tagged transfers',
        'Balances, budget actuals and goal progress are computed on read — never stored',
        'Six-month reports, CSV export, JSON backup, light/dark theme and reduced-motion support'
      ],
      outcome:
        'A private, offline-by-design app with a written spec and a test suite that pins the money rules.'
    },
    demo: null,
    video: {
      src: '/assets/work/budget-desk-tour.mp4',
      poster: '/assets/work/budget-desk-tour-poster.jpg',
      captions: '/assets/work/budget-desk-tour.vtt'
    }
  }
];
```

After the A2 captures exist, add 2–4 `gallery` entries per project
(`{ avif, webp, alt }`, same 1600/800 outputs); the dialog renders the strip only when the array is
non-empty, so an unfinished capture never shows an empty row.

> UCO-TMS: the local checkout defaults to SQLite (`DB_CONNECTION=sqlite`); confirm the deployed driver
> before publishing the `MySQL` tag. SMR uses Laravel 12 + Blade + Alpine.js + Tailwind 3 + Chart.js 4.
> Budget Desk uses Livewire 3, Tailwind 4, Chart.js and canvas-confetti.

### A2 — Screenshot map

| Project | Card media (1600×1000 cover) | Dialog gallery (2–4) |
|---|---|---|
| SMR | `.screens/desktop-admin-dashboard.png` — 1440×2025, crop top 1440×900 or reshoot the viewport | `desktop-admin-posts.png`, `flow-report-october-generated.png`, `flow-report-october-published.png`, `desktop-admin-uploads.png` (optionally `desktop-viewer-dashboard.png` for the role story) |
| UCO-TMS | new capture: `/socmed/dashboard` (or the public landing on a 1440×900 viewport) | landing `/`, social-media request form, tracking result `/track`, `layoutservices` or `admin` dashboard, `/user/dashboard` |
| Budget Desk | `docs/tour/frames/02-dashboard.png` — 3840×2160, downscale | `05-expenses`, `07-bills`, `09-savings`, `12-reports` (optionally `13-reports-charts`) |

All SMR shots live in `.../facebook page/.screens/`. Avoid the near-empty role screenshots (~8–10 KB);
they are 404/empty states. Budget frames already use fictional data (Alex, BPI, GCash) and a dark theme
that sits well in the crimson environment. SMR shows the public UZ page, but still get sign-off and keep
names out of comments.

### A3 — Capture runbook

SMR (existing build, seeded accounts from `README.md`):

```bash
cd "C:\Users\User\Documents\Social Media Report\facebook page\smr-app"
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan smr:import "..\Oct-01-2026_Nov-01-2026_994192923140482.csv"
npm install && npm run build
php artisan serve
# login admin@smr.test / Password123! (seed default — local only)
```

Capture at 1440×900, DPR 1: dashboard, post explorer, uploads, monthly report (generate → publish),
and one viewer session for the access-control story.

UCO-TMS (no seeder for teams):

```bash
cd "C:\Users\User\Documents\UCO-TMS"
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan user:create-admin
npm install && npm run build
php artisan serve
```

Then create fictitious team users (content_team, creative_team, yearbook_team) from Account → Users.
Capture the public landing, one request form, a tracking result, the social-media queue, a creative
queue, `/user/dashboard`, and the notification feed. Notifications need `php artisan reverb:start` and a
queue worker (`php artisan queue:listen --tries=1`) while you take the shot; static screens work without them.

Budget Desk: no re-shoot needed — use the existing tour frames. If any numbers should change, re-run
`php artisan migrate:fresh && php artisan db:seed --class=DemoSeeder` and re-capture at 1920×1080.

### A4 — Video encodes

Budget Desk source: `docs/budget-desk-tour.mp4` (~67 MB, 5 min), poster 1920×1080, captions `.srt`.

```bash
ffmpeg -i docs/budget-desk-tour.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 29 -preset slow \
  -c:a aac -b:a 96k -movflags +faststart public/assets/work/budget-desk-tour.mp4
ffmpeg -i docs/budget-desk-tour.srt public/assets/work/budget-desk-tour.vtt   # then add the WEBVTT header if missing
```

Target ≤12 MB. If it lands over, drop to `scale=960:-2` and `-crf 30`. Poster: resize to 1280×720,
≤150 KB. SMR has `presentation/Social-Media-Report-System.mp4` (~14.6 MB) — trim to 60–90 s and encode
the same way if the live demo stays behind the JS challenge. Always `preload="none"`, no autoplay,
`playsinline`, captions on.

### A5 — Claims: safe vs. avoid

**Safe (verified in the repos or profile):** Laravel 12 / PHP 8.2; SMR roles admin/encoder/viewer; UCO
five public forms, ten queues, seven role types, Reverb notifications; SMR CSV + PDF import; Budget Desk
26 tests / 114 assertions, five-minute tour; 3+ years freelancing; BSIT 2024 and MIT in progress.

**Avoid until you have evidence:** any percentage of time saved, staff/student counts, "used by the
whole university", "in production since …", earnings figures, "first/only", awards. For client work,
"built for" is safe; "used daily by N people" is not.

**Positioning fix:** UCO-TMS is an internal communication-office request system — not a "student task
management system". Use the corrected description in A1 everywhere, including the content file in
`Documents/zed/informations.txt` when it is next edited.

---

## Appendix B — Personal / site content pack (from `informations.txt`)

Facts below are from `Documents/zed/informations.txt` plus the profile already used to build the site.
They fill the gaps in `src/data/site.js` and the page copy; §7 still applies — live copy wins until a
change is approved.

### B1 — Confirmed values for `src/data/site.js`

Only the existing fields; do not add new keys without updating the renderer.

```js
email: 'zedvorastudio@gmail.com',
formEndpoint: '', // decide: real Formspree/Web3Forms endpoint, or remove the form (see B5)
socials: [
  { label: 'GitHub', href: 'TODO_GITHUB' },     // create or keep hidden — do not ship TODO_
  { label: 'LinkedIn', href: 'TODO_LINKEDIN' }, // same
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61596320146334' }
]
```

- Email is confirmed: `zedvorastudio@gmail.com` (Gmail is fine; a `@zedvora` domain is optional later).
- Facebook is the ZEDVORA page, not a personal profile. Link text: "Facebook — ZEDVORA".
- GitHub and LinkedIn are listed as "soon" in the info file. Do not ship `TODO_*` URLs or disabled
  placeholders forever: either create them before launch or hide the icon.
- Location: **Zamboanga City, Philippines**; availability line stays "Available for select projects"
  unless changed. "Location or service availability: facebook" in the info file is a stray value —
  ignore it.

### B2 — Identity and proof points

| Field | Value | Notes |
|---|---|---|
| Name | Zaeed N. Cervantes | Site currently shows this in the profile card |
| Brand | ZEDVORA | "Ideas into Digital Experiences." |
| Title | Full-Stack Developer | Use "PHP / Laravel" or "Web Systems" as the qualifier; "Vibe Coder" is a workflow note, not a job title |
| Location | Zamboanga City, Philippines | Remote-friendly |
| Experience | 3+ years freelancing | As stated in the info file; overlaps BSIT |
| Current role | Social Media Associate | Facebook, Instagram, YouTube, TikTok: content planning, posting strategy, performance monitoring |
| Education | BS Information Technology, Western Mindanao State University, 2024 | MIT in progress at the same university |
| Email | zedvorastudio@gmail.com | |
| Facebook | [ZEDVORA page](https://www.facebook.com/profile.php?id=61596320146334) | |
| LinkedIn / GitHub | TODO | Missing from the info file |

The social-media work is a genuine differentiator: it explains why the systems include reporting,
analytics and content workflows. Use it, but keep the title as developer.

### B3 — About copy (proposed, needs approval)

Replaces the current two paragraphs in `#about` only if approved; otherwise extend them.

> I'm Zaeed, a full-stack developer in Zamboanga City. Over the past three years I've built web systems
> and business sites for schools and small organizations — internal reporting tools, request desks,
> capstone platforms, and custom apps — mostly with Laravel, MySQL, and Tailwind.
>
> I also work as a social media associate, managing Facebook, Instagram, YouTube, and TikTok pages:
> content planning, posting schedules, and performance monitoring. That side of the work shapes how I
> build — I think about how people find, read, and use a product, not only how it is coded.
>
> I graduated with a BS in Information Technology from Western Mindanao State University in 2024 and am
> now pursuing a Master of Information Technology there. I use AI-assisted tools like Claude and Qoder
> to move faster, while keeping data modeling, permissions, testing, and handover fully reviewed.

If "Vibe Coder" should appear, put it in the last paragraph as "Sometimes I call that vibe coding; the
review and testing are what keep it useful." — never in the H1 or the title chip.

### B4 — Services mapping

Keep the four existing cards (they have matching visuals). Fold the info file's longer list into them
as points instead of adding six thin cards:

| `informations.txt` service | Destination |
|---|---|
| Website Design / Redesign | Small Business Systems → point "Design & redesign" |
| Business Website / Landing Page | Small Business Systems → point "Business sites & landing pages" |
| E-commerce Development | Small Business Systems → point "Product catalog & checkout" |
| Website Maintenance | Small Business Systems → point "Maintenance & hosting" |
| Website Development | Web System Development (existing card) |
| Database Management | Web System Development → point "Schema, migrations & backups" (not a standalone service — "database management" reads like data entry) |
| Thesis / Capstone | Capstone & Thesis Systems → add "Documentation & walkthrough" |

A fifth card ("Business Websites") is possible later, but it needs a new `visual` and a layout check —
out of scope unless approved.

### B5 — Skills to show

Current About stack list: PHP, Laravel, JavaScript, MySQL, REST APIs, UI engineering. Recommended
grouping for the About chips or a skills block:

- **Backend:** PHP, Laravel, MySQL, REST APIs
- **Frontend:** JavaScript, Tailwind CSS, Bootstrap, Alpine.js, Livewire, HTML/CSS
- **Data & reporting:** schema design, CSV/PDF imports, Chart.js
- **Tools:** Git, GitHub, VS Code, cPanel, Cloudflare
- **Design:** Figma, Canva, Photoshop
- **CMS:** WordPress
- **AI-assisted:** Claude, Qoder (workflow, not a technology)

Do not list: **npm** (a package manager), **InfinityFree** (hosting — mention under deployment, not
skills), or **"quder"** (typo). **React** appears in the info file but in none of the three reviewed
repos (SMR is Blade/Alpine, UCO-TMS is Livewire, Budget Desk is Livewire). Add React only with a
React-built project, or label it "familiar" — do not present it as a core stack.

### B6 — Philosophy / differentiator copy

Use one short pull-quote, not three paragraphs:

> Functional first. Accessible by default. Built to be maintained.

And one differentiator line for the About or Services intro:

> I build the system and understand the channels that feed it — so the site, the content, and the
> reporting are designed as one piece, not three disconnected handoffs.

This replaces the info file's long "Design & Development Philosophy" and "What Makes My Services
Different" paragraphs; the site does not need both in full.

### B7 — Contact and launch decisions

| Item | Value | Action |
|---|---|---|
| Email | zedvorastudio@gmail.com | Put in `site.js`; wire the copy-to-clipboard button |
| Facebook | ZEDVORA page URL | Put in `socials` |
| LinkedIn | "soon" | Create or hide |
| GitHub | "soon" | Create or hide — clients and employers look for it |
| Form | `informations.txt` says "soon"; the page already shows a form | **Decide:** add a real endpoint (Formspree/Web3Forms) or remove the form and use a mailto button. A form that silently fails is worse than no form |
| Availability | "Available for select projects" | Confirm or change |
| Response time | Not stated in the info file | Only claim "within 24 hours" if it is true; otherwise omit |
| Location line | "facebook" (stray) | Replace with "Zamboanga City, Philippines · remote" |

**Corrections to the info file itself (for the next edit):** missing spaces after colons; "building
digital experience" → "experiences"; "reactjs" → React; "i am the developer" → role text; "Own" →
Personal project; "soon" links removed until real; "System that monitor…" and "system manage ta task…"
replaced by the A1 copy; "three years" → "3+ years"; UCO-TMS described as an internal request system.
