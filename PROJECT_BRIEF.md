You are a senior full-stack frontend architect and a world-class UI/UX designer. You are helping me build a FRONTEND-ONLY, fully interactive DUMMY (demo) of a product called "Celebs Alley". It must look and feel like a real, premium, high-end software product, but all data is fake and comes from local JSON files. There is NO real backend.

FIRST ACTION: Save this entire message as PROJECT_BRIEF.md in the project root. Re-read PROJECT_BRIEF.md at the start of every phase. It is the single source of truth.

==================================================
1. PRODUCT OVERVIEW
==================================================
Celebs Alley is a multi-tenant B2B2C, AI-powered beauty commerce SaaS marketplace. Tagline: "BEAUTY | WELLNESS | TREATMENT".

- Consumers do an AI-assisted face/skin analysis (simulated), get 8 configurable skin parameter scores, receive personalized explainable product recommendations, and buy from multiple sellers.
- Distributors/brands (sellers) manage products, pricing, inventory, orders, staff, and subscriptions through their own SaaS portal.
- A Super Admin governs everything, including an admin-configurable AI Parameter Engine (parameters are NEVER hard-coded in logic).
- Consultants (skin experts) handle appointments and client plans.
- The public marketing website is multi-page (NOT a single page).

The scan/AI is SIMULATED: it returns realistic fake scores. Never integrate any real AI or payment API.

==================================================
2. NON-NEGOTIABLE RULES
==================================================
1. All UI text, labels, data, and code comments are in ENGLISH only.
2. Frontend only. No real backend, no real API calls, no external services except Google Fonts via next/font and placeholder images.
3. All data comes from JSON files in /src/data, read through a fake API layer (with artificial delay) and a persisted global store. Never hard-code data inside components.
4. Work ONLY on the scope of the current phase. Do not rewrite, restyle, or delete files from earlier phases unless the phase prompt explicitly says so. Do not build features from future phases.
5. Every screen must be fully responsive and have a distinct layout strategy for MOBILE, TABLET, and DESKTOP (see section 5). Test mentally at 375px, 768px, and 1280px+.
6. Every interactive element must actually work: buttons, forms, filters, tabs, modals. No dead buttons, no "lorem ipsum", no empty placeholder text in finished areas. Areas that belong to a future phase must show a polished "Coming in Phase X" card, never a blank page.
7. Zero console errors, zero hydration errors, zero TypeScript errors. The project must pass "npm run build" at the end of every phase.
8. Respect prefers-reduced-motion.
9. No git commands. Do not initialize or use git.
10. At the end of every phase, give a short report: files created, how to run, and a manual test checklist.

==================================================
3. TECH STACK (fixed)
==================================================
- Next.js (latest stable, App Router) + TypeScript (strict) + Tailwind CSS (use whatever version create-next-app installs and configure design tokens accordingly)
- framer-motion (page transitions, reveals, gauges, layout animations)
- swiper (carousels)
- lenis (smooth scroll, PUBLIC website only, not inside panels)
- gsap (hero and scan sequences)
- recharts (charts, radar)
- zustand with persist middleware (global state)
- react-hook-form + zod + @hookform/resolvers (forms)
- @tanstack/react-table (tables)
- @dnd-kit/core + @dnd-kit/sortable (drag reorder)
- sonner (toasts)
- canvas-confetti (success moments)
- lucide-react (icons)
- cmdk (command palette)
- Radix UI primitives where helpful (dialog, tooltip, tabs, dropdown-menu, popover, switch, checkbox, select)
- clsx + tailwind-merge + class-variance-authority, date-fns
Do not add other heavy libraries without a clear reason.

==================================================
4. DESIGN SYSTEM ("Gold on Black")
==================================================
Reference images are in /reference (logo images and a full-page website screenshot). Match their luxury look: near-black backgrounds, gold foil accents, cream light sections, elegant serif headings with script accents, wide-spaced uppercase labels.

Color tokens:
- bg-base: #0B0907 (page background)
- bg-surface: #1A130B (cards, panels)
- bg-elevated: #241A0F (hover, modals)
- gold-300: #E8C77A, gold-500: #C99A45, gold-700: #B8812F
- gold-gradient: linear-gradient(135deg, #B8812F 0%, #E8C77A 50%, #B8812F 100%)
- cream: #F3EAD9 (light sections), cream-ink: #1A130B (text on cream)
- text-primary: #F5EDE0, text-muted: #A89A85, text-faint: #6F6354
- border-gold: rgba(201,154,69,0.18), border-strong: rgba(201,154,69,0.4)
- success #5FAF7A, warning #E0A93B, danger #D4604F, info #6FA3C7 (all slightly muted to suit the luxury palette)

Typography (next/font/google):
- Headings: Playfair Display
- Script accent words (like "Starts Here"): Allura (fallback Great Vibes)
- Body/UI: Montserrat
- Small labels: Montserrat, uppercase, tracking 0.2em to 0.3em, small size, gold
Responsive type scale using clamp().

Style rules:
- Rounded corners: 12 to 20px on cards, pill buttons.
- Subtle gold hairline borders, soft inner glow, glassmorphism only where it adds depth.
- Primary button: gold gradient with shimmer sweep on hover. Secondary: gold outline. Dark button on cream: black with gold text.
- Cards lift slightly on hover with a gold border glow (desktop only; on touch use press feedback).
- Currency is Indian Rupee (₹), Indian number formatting (e.g. ₹1,24,500). Dates like "09 Oct 2026". Use Indian names, cities, GST/PAN style fields.

Brand signature motion (reusable components):
- Gold shimmer on the logo
- Gold-dust particle canvas (lightweight, pauses when off-screen)
- Scroll reveal (fade + rise)
- Scan-line animation
- 3D tilt on product cards (desktop only)
- Animated number counters
- Skeleton loaders in the same dark-gold style

Motion standards: ease [0.22, 1, 0.36, 1], durations 200 to 700ms, stagger 60 to 100ms, page transition fade + 12px rise.

==================================================
5. DEVICE STRATEGY (distinct UX, not just shrinking)
==================================================
- MOBILE (<768px): top app bar + BOTTOM TAB BAR (max 5 items, extras in a "More" bottom sheet), bottom sheets instead of modals, swipe gestures where natural, full-screen camera/scan, sticky action bars, large 44px+ touch targets, single column.
- TABLET (768 to 1279px): ICON-RAIL sidebar (expands on tap/hover with labels), two-pane master-detail layouts (list + detail), 2 to 3 column grids, touch-friendly sizing.
- DESKTOP (1280px+): full left sidebar (collapsible), multi-column dashboards, hover effects, data tables, command palette (Ctrl/Cmd+K), keyboard shortcuts.
Public website: top navbar on desktop/tablet, full-screen animated drawer menu on mobile.

==================================================
6. PANELS AND ROUTES
==================================================
/                      Public website (/about /services /technology /shop /experts /blog /faq /contact /book /legal/*)
/app/...               Customer panel (B2C)
/seller/...            Distributor / Seller portal (B2B SaaS)
/admin/...             Super Admin (also role-filtered views for Support Agent and Finance Manager)
/consultant/...        Consultant panel
/demo                  Role switcher + "Reset demo data"
/styleguide            Design system showcase

Roles (all present in demo data): Super Admin, Admin, Product Manager, AI/Rule Manager, Distributor Owner, Distributor Manager, Inventory Manager, Sales Executive, Consultant, Customer, Support Agent, Finance Manager.

==================================================
7. DATA, FAKE API AND STATE
==================================================
- Folder: src/data/*.json (realistic, rich, Indian context).
- Fake API layer: src/lib/api.ts. Functions return Promises with random 300 to 800ms delay, support simple filtering/sorting/pagination, and read from the persisted store first (so edits persist) and JSON second.
- Global store: Zustand + persist (localStorage), hydration-safe (no SSR mismatch). Slices: session (current role/user), ui, cart, orders, scans, sellers, inventory, parameters, notifications, appointments, auditLog.
- "Reset demo data" restores everything from the JSON files.
- Cross-panel sync happens through this shared store (e.g. an order placed by a customer later appears in the seller and admin panels).
- The 8 AI parameters are DATA (parameters.json), editable by the admin; all result screens read from the store, never from constants.

==================================================
8. CODE STANDARDS
==================================================
- TypeScript strict, shared types in src/types.
- Folder layout:
  src/app (routes), src/components/ui (design system), src/components/layout (shells), src/components/shared, src/features/<panel> (panel-specific), src/data, src/lib, src/store, src/hooks, src/types, src/config (nav configs).
- Small reusable components, no giant files (aim under 300 lines per file).
- Accessible: semantic HTML, aria labels, visible focus rings (gold), keyboard navigable.
- next/image for images, with placeholder/blur; use remote placeholder images or generated gradient/SVG art. Configure next.config for allowed image hosts.

==================================================
9. PHASE ROADMAP (build ONLY the phase I ask for)
==================================================
Phase 1: Foundation (project, design system, all panel shells, data, fake API, store, /demo, /styleguide)
Phase 2: Public website (all marketing pages, animations)
Phase 3: Customer auth, onboarding, face scan, 8-parameter results
Phase 4: Recommendations and commerce (shop, cart, checkout, orders, account)
Phase 5: Distributor / Seller portal
Phase 6: Super Admin (incl. Parameter Manager wired to customer results)
Phase 7: Consultant, Support and Finance views, cross-panel sync
Phase 8: Polish and QA (responsive pass, animation tuning, performance, empty/error states)
