# Feature Specification: P5-F1 — Marketing Landing Page

**Phase:** 5 — Public Presence  
**Feature ID:** P5-F1  
**Feature Name:** Marketing Landing Page (`/`)  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-10  
**Estimated Effort:** 2–3 days  
**Dependencies:** None (no new npm packages required)  
**Branch:** `feature/P5-F1-landing-page`

---

## 1. Overview

TaskFlow's root route (`/`) currently shows the default Next.js template. This feature replaces it with a production-grade marketing landing page that:

- Communicates TaskFlow's value clearly and quickly
- Shows the actual app dashboard as the hero visual (the product is the pitch)
- Converts visitors to the `/sign-up` route with a single, confident primary CTA
- Stays on brand: dark, sharp, motivational, Raycast-influenced
- Targets WCAG AAA accessibility

This page is a **brand-register surface**. It must feel like it was made with intention, not assembled from a template. Read `PRODUCT.md` and `DESIGN.md` at the project root before writing any code.

### What success looks like

- A first-time visitor lands, understands what TaskFlow does within 5 seconds, and can sign up in one click
- The page is pixel-perfect on mobile (375px) and desktop (1440px)
- All quality gates pass (build, lint, accessibility audit)
- No default Next.js content remains

---

## 2. Design Context

> **REQUIRED READING before implementation:**
> - `PRODUCT.md` — brand personality, anti-references, design principles
> - `DESIGN.md` — color tokens, typography scale, spacing, motion rules

### Key design decisions

| Decision | Value | Why |
|---|---|---|
| Background | `#0d0d0d` (dark) | Brand statement. Dark-first always. |
| Accent | `#18E299` | Only color with chroma. Use sparingly. |
| Primary font | Inter (already loaded) | Used at extreme weight/scale. No new font. |
| Hero H1 weight | 900 (Black) | Confident, not corporate |
| Hero image | App dashboard screenshot | Product IS the pitch |
| Color strategy | Restrained dark | One accent ≤10% of surface |

### Anti-patterns (do not do these)

- ❌ Gradient text (`background-clip: text`)
- ❌ Large rounded icons above headings (template look)
- ❌ Identical feature card grid (icon + title + text × 6)
- ❌ Hero-metric block (big number + small label + gradient)
- ❌ Side-stripe borders on cards (`border-left: 3px solid green`)
- ❌ "Boost your productivity" copy or any generic headline
- ❌ Any light background on the page canvas

---

## 3. Page Architecture

### Route

`app/(public)/page.tsx` (or `app/page.tsx` depending on your route group setup)

> **Note:** Check if `/` is currently inside a route group. If it is a catch-all inside `(app)`, move it to `(public)` or the root layout. The landing page must be publicly accessible without authentication.

### Layout

The landing page gets its **own layout** — not the `AppShell` used by the authenticated app. Create `app/(public)/layout.tsx` if it doesn't exist. This layout renders the marketing `<Navbar>` and `<Footer>` only.

### File structure to create

```
app/
  (public)/
    layout.tsx          ← Marketing layout (Navbar + Footer + children)
    page.tsx            ← Landing page (assembles sections)

components/
  marketing/
    navbar.tsx          ← Marketing navigation bar
    footer.tsx          ← Marketing footer
    hero-section.tsx    ← Hero (H1 + subhead + CTAs + dashboard preview)
    features-section.tsx ← Alternating feature layout
    cta-section.tsx     ← Bottom conversion section
    dashboard-preview.tsx ← Dashboard screenshot/mockup component
```

---

## 4. Section Specifications

### Section 1: Navigation Bar (`navbar.tsx`)

**Behavior**
- Sticky on scroll: `position: sticky; top: 0; z-index: 50`
- Transparent at top of page; adds `backdrop-filter: blur(12px)` + subtle background `rgba(13,13,13,0.85)` on scroll
- Hides the scroll-triggered background when user returns to top

**Layout (desktop)**
```
[Logo + Wordmark]          [Features · Pricing · Sign In]    [Get Started →]
```

**Layout (mobile)**
```
[Logo + Wordmark]                                             [☰ Menu]
```
Mobile: hamburger opens a drawer (use shadcn `Sheet`) with stacked links.

**Specs**
| Element | Value |
|---|---|
| Height | 64px |
| Background (scroll) | `rgba(13,13,13,0.85)` + `backdrop-filter: blur(12px)` |
| Bottom border | `1px solid rgba(255,255,255,0.06)` on scroll |
| Logo text | "TaskFlow" — Inter 700, `#ededed` |
| Logo icon | Lucide `CheckSquare` or `Zap` in `#18E299`, 20×20 |
| Nav links | Inter 500, `#a0a0a0`, hover `#ededed`, `transition: color 150ms` |
| CTA button | `bg-[#18E299] text-[#0d0d0d] font-semibold` + hover `bg-[#0fa76e]` |
| CTA label | "Get Started" |
| CTA href | `/sign-up` |

**Accessibility**
- `role="navigation"` with `aria-label="Main navigation"`
- Mobile menu button: `aria-expanded`, `aria-controls` pointing to drawer ID
- All nav links keyboard-navigable

---

### Section 2: Hero (`hero-section.tsx`)

This is the most important section. One idea, one CTA, the product as the image.

**Layout (desktop)**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Eyebrow label]                                             │
│                                                              │
│  Task management                                             │
│  that gets out                                               │
│  of your way.                                                │
│                                                              │
│  [Subheadline — one sentence, max 52ch]                      │
│                                                              │
│  [Get Started — filled green]   [Sign In — ghost]            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │         DASHBOARD SCREENSHOT / MOCKUP                │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Specs**

| Element | Value |
|---|---|
| Background | `#0d0d0d` |
| Top padding | `pt-32` (128px) above content, below navbar |
| Eyebrow | "Personal Task Management" — Inter 600, 12px, `#18E299`, `tracking-widest`, uppercase |
| H1 text | "Task management that gets out of your way." (or approved variant) |
| H1 font-size | `clamp(3rem, 8vw, 7rem)` |
| H1 weight | 900 |
| H1 color | `#ededed` |
| H1 letter-spacing | `-0.03em` |
| H1 line-height | `1.05` |
| Subheadline | "Create tasks, set priorities, track what matters — from any device, without the noise." |
| Subheadline size | `clamp(1rem, 2vw, 1.25rem)` |
| Subheadline color | `#a0a0a0` |
| Subheadline max-width | `52ch` |
| CTA primary | "Get Started" → `/sign-up`, `bg-[#18E299] text-[#0d0d0d] font-semibold h-11 px-6 rounded-md` |
| CTA secondary | "Sign In" → `/sign-in`, ghost style: `border border-white/20 text-[#ededed] h-11 px-6 rounded-md hover:bg-white/5` |
| CTA gap | `gap-4` |
| Dashboard preview | See `dashboard-preview.tsx` spec below |

**Dashboard Preview (`dashboard-preview.tsx`)**

This is the most critical visual element. It must show the real app.

Implementation options (pick one based on your current state):

**Option A — Real screenshot (preferred for MVP)**
1. Take a screenshot of the dashboard in dark mode with sample tasks loaded
2. Save as `public/images/dashboard-preview.webp` (1600×1000px minimum)
3. Render with `next/image`, `priority`, explicit `width={1600}` `height={1000}`, `alt="TaskFlow dashboard showing task list with priorities and categories"`

**Option B — Live iframe (advanced, not recommended for initial launch)**
Skip for now.

**Option C — Placeholder frame (acceptable for dev only)**
A dark rounded rectangle with "Dashboard Preview" label — acceptable while in development, must be replaced before launch.

Visual treatment around the screenshot:
```
- Container: rounded-xl, border: 1px solid rgba(255,255,255,0.08)
- Outer glow: box-shadow: 0 0 80px rgba(24,226,153,0.08)
- slight perspective tilt: transform: perspective(1200px) rotateX(4deg) — only on desktop
- The tilt resets on scroll (optional scroll-linked animation)
```

**Entrance animation (respect `prefers-reduced-motion`)**
```css
/* All wrapped in @media (prefers-reduced-motion: no-preference) */
.hero-text { animation: fadeUp 400ms ease-out-quart both; }
.hero-sub  { animation: fadeUp 400ms ease-out-quart 80ms both; }
.hero-ctas { animation: fadeUp 400ms ease-out-quart 160ms both; }
.hero-img  { animation: fadeUpScale 600ms ease-out-quart 240ms both; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUpScale {
  from { opacity: 0; transform: translateY(32px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

---

### Section 3: Features (`features-section.tsx`)

Three features, each in its own full-width row. **Alternating layout** — text and visual swap sides. No card grid.

**Feature 1 — Capture (text left, visual right)**
- Eyebrow: "Capture"
- Title: "Every task, instantly."
- Body (2 sentences max): "Type a title, set a priority, pick a due date. Done. TaskFlow stays out of your way so you can stay in yours."
- Visual: Cropped screenshot of the task creation form/sheet in dark mode

**Feature 2 — Organize (visual left, text right)**
- Eyebrow: "Organize"
- Title: "Categories that actually work."
- Body: "Create your own categories with custom colors. Filter, group, and sort until the view matches how you think."
- Visual: Cropped screenshot of the task list with filters/categories visible

**Feature 3 — Focus (text left, visual right)**
- Eyebrow: "Focus"
- Title: "Your dashboard, your signal."
- Body: "Overdue tasks, due today, high priority — surfaced the moment you log in. No noise, no setup."
- Visual: Cropped screenshot of the dashboard stats/overview section

**Layout specs per row**
```
Desktop: grid-cols-2, gap-16, items-center
Mobile:  grid-cols-1, text stacked above visual
```

| Element | Value |
|---|---|
| Section background | `#0d0d0d` (no zebra striping — rely on spacing) |
| Section vertical padding | `py-24` (96px) |
| Eyebrow | Inter 600, 12px, `#18E299`, uppercase, `tracking-widest` |
| Title | `clamp(2rem, 5vw, 3.5rem)`, Inter 800, `#ededed`, letter-spacing `-0.02em` |
| Body | 16px, Inter 400, `#a0a0a0`, `max-w-prose`, `leading-relaxed` |
| Visual container | `rounded-xl border border-white/8 overflow-hidden` |
| Scroll reveal | `@IntersectionObserver` — fade-up + translateY(24px) → 0 when in view |

**Accessibility**
- Each feature image: descriptive `alt` text describing what the screenshot shows
- Decorative dividers: `aria-hidden="true"`

---

### Section 4: Bottom CTA (`cta-section.tsx`)

A single-purpose section. One message. One button. No distractions.

**Layout**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│            Start organizing today.                           │
│     It's free. No credit card required.                      │
│                                                              │
│                 [Create free account →]                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Specs**
| Element | Value |
|---|---|
| Background | `#141414` (slightly elevated from page background — use `--card` dark token) |
| Top/bottom border | `1px solid rgba(255,255,255,0.08)` |
| Vertical padding | `py-24` |
| Title | "Start organizing today." — Inter 800, `clamp(2rem, 5vw, 3.5rem)`, `#ededed` |
| Subtitle | "Free for everyone. No credit card required." — Inter 400, 18px, `#a0a0a0` |
| CTA button | "Create free account" → `/sign-up`, same primary style as hero CTA, size `h-12 px-8` |
| Scroll reveal | Fade-up on intersection |

---

### Section 5: Footer (`footer.tsx`)

**Layout (desktop)**
```
[TaskFlow logo + tagline]                     [Features · Privacy · Terms · Contact]

                    © 2025 TaskFlow. Built for focus.
```

**Layout (mobile)**
```
[Logo]
[Tagline]
[Links stacked]
[Copyright]
```

**Specs**
| Element | Value |
|---|---|
| Background | `#0d0d0d` |
| Top border | `1px solid rgba(255,255,255,0.06)` |
| Vertical padding | `py-12` |
| Logo | Same as navbar |
| Tagline | "Task management that gets out of your way." — 14px, `#a0a0a0` |
| Footer links | 14px, `#666666`, hover `#a0a0a0`, `transition: color 150ms` |
| Copyright | 12px, `#4d4d4d` |
| Links to include | Features (anchor to features section) · [Terms of Service](/terms) · [Privacy Policy](/privacy) · [Sign Up](/sign-up) |

---

## 5. Responsive Behavior

| Breakpoint | Key changes |
|---|---|
| `< 640px` (mobile) | Hero: single column. H1 at `clamp(3rem, 8vw, 5rem)`. Dashboard preview full width. Features: stacked. Navbar: hamburger menu. |
| `640px–1024px` (tablet) | Hero: single column, dashboard preview narrower. Features: start two columns. |
| `> 1024px` (desktop) | Full two-column layout, dashboard preview at full tilt. |

**Container width**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` throughout.

**No horizontal scroll** at any breakpoint. Test at 375px, 768px, 1440px.

---

## 6. Accessibility Checklist

These must all pass before the feature is considered complete:

- [ ] Single `<h1>` on the page
- [ ] Heading hierarchy: H1 → H2 (section titles) → H3 (feature eyebrows)
- [ ] All images have descriptive `alt` text (not "screenshot" or "image")
- [ ] All interactive elements are keyboard-reachable (Tab order correct)
- [ ] Focus rings visible: `2px solid #18E299` with `outline-offset: 2px`
- [ ] Skip-to-content link at `<body>` start, visible on focus: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>`
- [ ] Navbar hamburger button has `aria-label="Open menu"` / `aria-label="Close menu"`
- [ ] Mobile drawer has `role="dialog"` and traps focus when open
- [ ] CTA buttons have descriptive accessible names (not just "Click here")
- [ ] Color contrast: all body text ≥7:1 (WCAG AAA), all large text ≥4.5:1
- [ ] Animations respect `prefers-reduced-motion: reduce` — wrap all `@keyframes` usage
- [ ] No information conveyed by color alone

---

## 7. Proxy / Route Protection

The landing page must be accessible to unauthenticated users. Check `proxy.ts`:

```ts
// Ensure '/' is NOT in PROTECTED_PATHS
// Ensure '/' is NOT in AUTH_PATHS (authenticated users may visit it)
// The landing page should be accessible to everyone
```

If `proxy.ts` currently redirects `/` to `/dashboard` for authenticated users, that behavior is acceptable but not required. Discuss with the team whether authenticated users landing on `/` should be redirected to `/dashboard` or see the marketing page.

---

## 8. SEO

Add to `app/(public)/page.tsx` or the `(public)` layout:

```tsx
export const metadata: Metadata = {
  title: "TaskFlow — Task Management That Gets Out of Your Way",
  description:
    "TaskFlow helps individuals create, organize, and complete tasks with zero friction. Free to use. No credit card required.",
  openGraph: {
    title: "TaskFlow — Task Management That Gets Out of Your Way",
    description:
      "Create tasks, set priorities, track what matters — from any device, without the noise.",
    type: "website",
    images: ["/og-image.png"], // 1200×630px dark branded image
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow",
    description: "Task management that gets out of your way.",
    images: ["/og-image.png"],
  },
};
```

Create `/public/og-image.png` (1200×630px): dark background, "TaskFlow" wordmark in center, green accent. Can be generated with a simple HTML-to-image export or designed in Figma.

---

## 9. File Change Summary

### Files to Create

| File | Purpose |
|---|---|
| `app/(public)/layout.tsx` | Marketing shell layout |
| `app/(public)/page.tsx` | Landing page assembly |
| `components/marketing/navbar.tsx` | Marketing navigation bar |
| `components/marketing/footer.tsx` | Marketing footer |
| `components/marketing/hero-section.tsx` | Hero section component |
| `components/marketing/features-section.tsx` | Alternating features section |
| `components/marketing/cta-section.tsx` | Bottom conversion CTA |
| `components/marketing/dashboard-preview.tsx` | Dashboard screenshot wrapper |
| `public/images/dashboard-preview.webp` | Dashboard screenshot (you capture this) |
| `public/og-image.png` | Open Graph / Twitter card image |

### Files to Modify

| File | Change |
|---|---|
| `proxy.ts` | Verify `/` is not incorrectly protected or auto-redirecting |

### Files to Delete

| File | Reason |
|---|---|
| Any default Next.js content in `app/page.tsx` | Replaced by the landing page |

---

## 10. Acceptance Criteria

### Functional

- [ ] `/` loads the marketing landing page for both authenticated and unauthenticated users
- [ ] "Get Started" CTA navigates to `/sign-up`
- [ ] "Sign In" link navigates to `/sign-in`
- [ ] Mobile hamburger menu opens and closes correctly
- [ ] Mobile drawer focus is trapped when open
- [ ] All footer links navigate to correct routes

### Visual (manual review)

- [ ] Page matches DESIGN.md: dark background, Inter, `#18E299` accent, correct weight/scale
- [ ] Dashboard preview image is sharp and visible
- [ ] No default Next.js content visible
- [ ] No light background anywhere on the page canvas
- [ ] Entrance animations run on first load (and are disabled with `prefers-reduced-motion`)
- [ ] Feature sections alternate left/right correctly on desktop
- [ ] Feature sections stack correctly on mobile

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Lighthouse accessibility score ≥ 90 on `/`
- [ ] No horizontal scroll at 375px viewport

---

## 11. Implementation Order

Follow this order to reduce blocked work and allow visual review at each step:

| Step | Task | Estimated time |
|---|---|---|
| 1 | Create `app/(public)/layout.tsx` with Navbar + Footer shells | 20 min |
| 2 | Build `components/marketing/navbar.tsx` (desktop only first) | 45 min |
| 3 | Build `components/marketing/footer.tsx` | 20 min |
| 4 | Build `components/marketing/hero-section.tsx` — layout only, no animation | 45 min |
| 5 | Capture dashboard screenshot, add to `public/images/dashboard-preview.webp` | 15 min |
| 6 | Build `components/marketing/dashboard-preview.tsx` | 20 min |
| 7 | Wire hero section in `app/(public)/page.tsx`, verify in browser | 15 min |
| 8 | Build `components/marketing/features-section.tsx` | 60 min |
| 9 | Build `components/marketing/cta-section.tsx` | 20 min |
| 10 | Add entrance animations to hero (with `prefers-reduced-motion` guard) | 30 min |
| 11 | Add scroll-reveal to feature sections | 30 min |
| 12 | Add mobile navbar drawer | 30 min |
| 13 | Responsive pass: test at 375px, 768px, 1440px | 30 min |
| 14 | Accessibility pass: keyboard nav, contrast, skip link, aria attributes | 30 min |
| 15 | Add SEO metadata, create OG image | 20 min |
| 16 | Run build + lint + verify Lighthouse | 15 min |

---

## 12. Related Documentation

- `PRODUCT.md` — brand personality, anti-references, design principles
- `DESIGN.md` — visual design system (color, typography, spacing, motion)
- `context/PRD.md` §7 — Information architecture and navigation
- `AGENTS.md` — Next.js 16 breaking changes, proxy.ts routing
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [next/image docs](https://nextjs.org/docs/app/api-reference/components/image)
