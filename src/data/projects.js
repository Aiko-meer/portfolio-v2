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
    gallery: [
      {
        avif: '/assets/work/smr-uploads-1600.avif',
        webp: '/assets/work/smr-uploads-1600.webp',
        alt: 'Upload history with validated Meta CSV imports and row counts'
      },
      {
        avif: '/assets/work/smr-viewer-1600.avif',
        webp: '/assets/work/smr-viewer-1600.webp',
        alt: 'Stakeholder viewer dashboard with published-only reporting'
      },
      {
        avif: '/assets/work/smr-report-1600.avif',
        webp: '/assets/work/smr-report-1600.webp',
        alt: 'Monthly report with executive summary and key metrics'
      }
    ],
    demo: {
      url: 'https://uzsocmed.freehosting.dev/login',
      label: 'Live demo',
      note: 'Viewer demo — credentials on request.'
    },
    video: {
      src: '/assets/work/smr-tour.mp4',
      poster: '/assets/work/smr-tour-poster.jpg',
      captions: '/assets/work/smr-tour.vtt'
    }
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
    stack: ['Laravel 12', 'Livewire 4', 'Tailwind CSS 4', 'Laravel Reverb'],
    device: 'monitor',
    media: {
      avif: '/assets/work/uco-admin-dashboard-1600.avif',
      webp: '/assets/work/uco-admin-dashboard-1600.webp',
      alt: 'UCO-TMS admin dashboard with request status totals, distribution and service breakdown'
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
    gallery: [
      {
        avif: '/assets/work/uco-landing-1600.avif',
        webp: '/assets/work/uco-landing-1600.webp',
        alt: 'UCO-TMS public landing page with the five-service request portal'
      },
      {
        avif: '/assets/work/uco-request-form-1600.avif',
        webp: '/assets/work/uco-request-form-1600.webp',
        alt: 'Social media request form with requester and request details'
      },
      {
        avif: '/assets/work/uco-track-1600.avif',
        webp: '/assets/work/uco-track-1600.webp',
        alt: 'Reference-number tracking result showing a pending social media request'
      }
    ],
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
    gallery: [
      {
        avif: '/assets/work/budget-expenses-1600.avif',
        webp: '/assets/work/budget-expenses-1600.webp',
        alt: 'Expense list with categories, accounts and running period totals'
      },
      {
        avif: '/assets/work/budget-bills-1600.avif',
        webp: '/assets/work/budget-bills-1600.webp',
        alt: 'Bills due across the current pay period with paid states'
      },
      {
        avif: '/assets/work/budget-savings-1600.avif',
        webp: '/assets/work/budget-savings-1600.webp',
        alt: 'Savings targets and goals with progress bars'
      },
      {
        avif: '/assets/work/budget-reports-1600.avif',
        webp: '/assets/work/budget-reports-1600.webp',
        alt: 'Six-month cashflow and savings reports'
      }
    ],
    demo: null,
    video: {
      src: '/assets/work/budget-desk-tour.mp4',
      poster: '/assets/work/budget-desk-tour-poster.jpg',
      captions: '/assets/work/budget-desk-tour.vtt'
    }
  }
];
