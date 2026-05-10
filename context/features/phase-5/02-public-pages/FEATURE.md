# Feature Specification: P5-F2 — Public Pages

**Phase:** 5 — Public Presence  
**Feature ID:** P5-F2  
**Feature Name:** Public Pages (Terms of Service, Privacy Policy, Cookie Policy, About, Contact)  
**Status:** Draft — Ready for Implementation  
**Date:** 2026-05-10  
**Estimated Effort:** 1.5–2 days  
**Dependencies:** P5-F1 (the marketing layout — `app/(public)/layout.tsx`, `navbar.tsx`, `footer.tsx` — must exist first)  
**Branch:** `feature/P5-F2-public-pages`

---

## 1. Overview

TaskFlow needs a set of public-facing pages beyond the landing page. These are required for legal compliance, user trust, and a professional first impression. They must all live inside the marketing shell (dark navbar + footer from P5-F1).

### Pages in scope

| Route | Page | Priority | Why needed |
|---|---|---|---|
| `/terms` | Terms of Service | **Required** | Legal — governs use of the product |
| `/privacy` | Privacy Policy | **Required** | Legal — GDPR/CCPA compliance, user data transparency |
| `/cookies` | Cookie Policy | **Recommended** | Legal — explains session/auth cookies |
| `/about` | About | **Recommended** | Trust signal, brand story |
| `/contact` | Contact | **Recommended** | Support entry point before in-app help exists |

> **Implementation note for junior engineers:** Start with the three Required pages. The Recommended pages follow the same pattern and can be added sequentially. Do not skip to a Recommended page until both Required pages are complete and passing all quality gates.

### What success looks like

- All required pages are live, readable, and accessible at their URLs
- All pages use the marketing shell from P5-F1 (no new layout work needed)
- Legal content is clear and scannable (correct heading hierarchy, table of contents)
- Pages feel on-brand, not generic boilerplate dropped into a white box

---

## 2. Design Context

> **REQUIRED READING before implementation:**
> - `PRODUCT.md` — brand personality, principles
> - `DESIGN.md` — specifically the "Legal page layout" section under Components

### Design system for legal/public pages

All pages use the dark brand shell. The content area is deliberately restrained — clean and readable — but the surrounding context (navbar, footer, background) stays fully on-brand.

| Element | Value |
|---|---|
| Page background | `#0d0d0d` |
| Content max-width | `72ch` (optimizes reading line length) |
| Content alignment | Left-aligned, centered in viewport with `mx-auto` |
| Content padding | `px-4 sm:px-6` horizontal, `py-16 sm:py-24` vertical |
| H1 weight/size | Inter 800, `clamp(2rem, 5vw, 3rem)` |
| H1 color | `#ededed` |
| H2 section headings | Inter 700, `1.25rem`, `#ededed` |
| H3 sub-headings | Inter 600, `1rem`, `#ededed` |
| Body text | Inter 400, 16px, `#a0a0a0`, `leading-relaxed` |
| Metadata line | Inter 500, 14px, `#4d4d4d` (e.g. "Last updated: May 2025") |
| Links in body | `#18E299`, hover `#0fa76e`, underline on hover |
| Desktop TOC | Sticky sidebar (see TOC spec below) |

### Anti-patterns for public pages

- ❌ White background ("dropped into a light doc layout")
- ❌ Card wrappers around the legal content — just prose, no frames
- ❌ Generic legal template look with tiny grey body text on white
- ❌ Missing the brand navbar/footer

---

## 3. Shared Infrastructure

Before building individual pages, create the shared pieces these pages all use.

### 3.1 Legal Page Layout Component

All legal/doc pages share the same prose layout. Extract it into a reusable wrapper.

**File:** `components/marketing/legal-layout.tsx` ← **NEW FILE**

```tsx
/**
 * LegalLayout
 *
 * Wraps legal/doc page content with consistent prose styling,
 * a page header (title + metadata), and a desktop sticky TOC.
 *
 * Usage:
 *   <LegalLayout title="Terms of Service" lastUpdated="May 2025" toc={tocItems}>
 *     <prose content />
 *   </LegalLayout>
 */
interface TocItem {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  description?: string;
  toc?: TocItem[];
  children: React.ReactNode;
}
```

**Structure:**
```
<main id="main-content">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
    <div class="lg:grid lg:grid-cols-[240px_1fr] lg:gap-16">

      <!-- TOC sidebar (desktop only) -->
      <aside class="hidden lg:block">
        <div class="sticky top-24">
          <p class="text-xs uppercase tracking-widest text-[#18E299] font-semibold mb-4">On this page</p>
          <nav>
            {toc.map(item => (
              <a href={`#${item.id}`} class="block text-sm text-[#666] hover:text-[#ededed] py-1 transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <!-- Content -->
      <article class="max-w-[72ch]">
        <p class="text-sm text-[#4d4d4d] mb-6">{lastUpdated}</p>
        <h1 class="...">{title}</h1>
        {description && <p class="...">{description}</p>}
        <hr class="border-white/8 my-8" />
        {children}
      </article>

    </div>
  </div>
</main>
```

**Prose styles** — apply to the `<article>` content using a CSS class (do not use `@tailwindcss/typography`):

```css
/* In globals.css or a dedicated legal.css module */
.prose-legal h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ededed;
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
  scroll-margin-top: 5rem; /* accounts for sticky navbar */
}
.prose-legal h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #ededed;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.prose-legal p {
  color: #a0a0a0;
  line-height: 1.7;
  margin-bottom: 1rem;
}
.prose-legal ul, .prose-legal ol {
  color: #a0a0a0;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
.prose-legal li {
  margin-bottom: 0.375rem;
  line-height: 1.6;
}
.prose-legal a {
  color: #18E299;
  text-decoration: none;
}
.prose-legal a:hover {
  color: #0fa76e;
  text-decoration: underline;
}
.prose-legal strong {
  color: #ededed;
  font-weight: 600;
}
```

### 3.2 TOC Anchor IDs

Every `<h2>` in legal content must have an `id` matching its TOC entry.

Example:
```tsx
<h2 id="acceptance">1. Acceptance of Terms</h2>
```

The TOC `TocItem` array is defined in each page and passed to `LegalLayout`.

---

## 4. Page Specifications

### 4.1 Terms of Service (`/terms`)

**File:** `app/(public)/terms/page.tsx` ← **NEW FILE**

**SEO metadata:**
```tsx
export const metadata: Metadata = {
  title: "Terms of Service — TaskFlow",
  description: "The terms and conditions governing your use of TaskFlow.",
};
```

**Page header:**
- Title: "Terms of Service"
- Last updated: "Last updated: May 2025"
- Description: "Please read these terms carefully before using TaskFlow."

**Required sections (create `<h2>` with matching `id` for each):**

| Section ID | Heading |
|---|---|
| `acceptance` | 1. Acceptance of Terms |
| `description` | 2. Description of Service |
| `account` | 3. Account Registration |
| `acceptable-use` | 4. Acceptable Use |
| `intellectual-property` | 5. Intellectual Property |
| `privacy` | 6. Privacy |
| `disclaimers` | 7. Disclaimers |
| `liability` | 8. Limitation of Liability |
| `termination` | 9. Termination |
| `changes` | 10. Changes to Terms |
| `contact` | 11. Contact |

**Content guidelines:**
- Write in plain English, not dense legalese
- Keep paragraphs short (3–5 sentences max)
- Use bullet lists for multiple rules/exceptions
- Link "Privacy Policy" in section 6 to `/privacy`
- Link "Contact" in section 11 to `/contact` or provide an email address

**TOC definition (pass to `LegalLayout`):**
```tsx
const toc: TocItem[] = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Description of Service" },
  { id: "account", label: "Account Registration" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "privacy", label: "Privacy" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "termination", label: "Termination" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact" },
];
```

---

### 4.2 Privacy Policy (`/privacy`)

**File:** `app/(public)/privacy/page.tsx` ← **NEW FILE**

**SEO metadata:**
```tsx
export const metadata: Metadata = {
  title: "Privacy Policy — TaskFlow",
  description:
    "How TaskFlow collects, uses, and protects your personal information.",
};
```

**Page header:**
- Title: "Privacy Policy"
- Last updated: "Last updated: May 2025"
- Description: "Your privacy matters. Here's exactly what we collect and how we use it."

**Required sections:**

| Section ID | Heading |
|---|---|
| `overview` | 1. Overview |
| `information-collected` | 2. Information We Collect |
| `how-we-use` | 3. How We Use Your Information |
| `data-storage` | 4. Data Storage and Security |
| `cookies` | 5. Cookies and Tracking |
| `third-parties` | 6. Third-Party Services |
| `your-rights` | 7. Your Rights |
| `data-retention` | 8. Data Retention |
| `children` | 9. Children's Privacy |
| `changes` | 10. Changes to This Policy |
| `contact` | 11. Contact Us |

**Content notes:**
- Section 2 must list exactly what is collected: name, email, task data (titles, descriptions, due dates, priorities), category names, session data, timezone preference
- Section 6 must name third parties: Neon (database hosting), Resend (email), Upstash (rate limiting)
- Section 7 must describe GDPR rights: access, correction, deletion, portability — even if enforcement is manual at this stage, it sets expectations
- Section 5: link to `/cookies` for full cookie details
- Section 11: provide contact email for privacy requests

---

### 4.3 Cookie Policy (`/cookies`)

**File:** `app/(public)/cookies/page.tsx` ← **NEW FILE**

**SEO metadata:**
```tsx
export const metadata: Metadata = {
  title: "Cookie Policy — TaskFlow",
  description: "How TaskFlow uses cookies and similar technologies.",
};
```

**Page header:**
- Title: "Cookie Policy"
- Last updated: "Last updated: May 2025"

**Required sections:**

| Section ID | Heading |
|---|---|
| `what-are-cookies` | What Are Cookies? |
| `how-we-use` | How We Use Cookies |
| `types` | Types of Cookies We Use |
| `managing` | Managing Cookies |
| `contact` | Contact |

**Section 3 "Types of Cookies" — use a table:**

| Cookie name | Type | Purpose | Duration |
|---|---|---|---|
| `session_token` | Essential | Authentication session | Session |
| `better_auth.*` | Essential | Auth state management (Better Auth) | Session |
| `theme` | Preference | Stores light/dark theme preference | 1 year |

Note: TaskFlow uses **no advertising or analytics cookies**. State this prominently.

**No TOC needed** — document is short enough to read linearly.

---

### 4.4 About (`/about`)

**File:** `app/(public)/about/page.tsx` ← **NEW FILE**

**SEO metadata:**
```tsx
export const metadata: Metadata = {
  title: "About TaskFlow",
  description:
    "TaskFlow is a personal task management tool built for people who prefer tools that get out of the way.",
};
```

**This page is different from the legal pages.** It is a short, brand-voiced narrative. Use `LegalLayout` for structure, but the content should read like the product's point of view, not a legal document.

**Page header:**
- Title: "About TaskFlow"
- No "Last updated" date

**Content structure:**

```
h2: Why TaskFlow exists
  → 2–3 paragraphs on the problem: productivity tools that are too complex, 
    too corporate, or too consumer-grade. TaskFlow is for people who want 
    a tool that respects their intelligence.

h2: What we're building
  → Describe the current state honestly: an individual task manager, 
    free to use, with a clean interface and a focus on the core loop: 
    capture → organize → complete.
  → Mention upcoming plans at a high level (without overpromising): 
    team collaboration, integrations, recurring tasks — on the roadmap.

h2: Built with intention
  → Short note on the tech choices and values: fast, reliable, 
    open to inspection, no dark patterns.

h2: Get in touch
  → Link to /contact or provide an email.
```

**Tone:** First-person plural ("we"), confident but not corporate. No "we're excited to" constructions.

---

### 4.5 Contact (`/contact`)

**File:** `app/(public)/contact/page.tsx` ← **NEW FILE**

**SEO metadata:**
```tsx
export const metadata: Metadata = {
  title: "Contact — TaskFlow",
  description: "Get in touch with the TaskFlow team.",
};
```

**Page header:**
- Title: "Contact"
- Description: "Questions, feedback, or issues — we're here."

**Layout:** Use `LegalLayout` without a TOC.

**Content:**

```
h2: General inquiries
  Email: hello@taskflow.app (or your actual contact email)

h2: Privacy and data requests
  For data access, correction, or deletion requests under GDPR/CCPA:
  Email: privacy@taskflow.app

h2: Bug reports
  → Link to GitHub issues (if public repo), or provide the same contact email.
  → Note expected response time: "We aim to respond within 2 business days."
```

> **No contact form for now.** A form requires a server action, email integration, and spam protection. Email links are sufficient for the initial stage. Add a form in a future iteration.

---

## 5. Navigation and Routing

### Add public pages to the footer

Update `components/marketing/footer.tsx` (from P5-F1) to include the new routes:

```tsx
const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
```

### Add About to navbar (optional)

Consider adding "About" to the marketing navbar between the feature links and the CTA. Keep the navbar link count low — max 4 items.

### Proxy rules

All five routes (`/terms`, `/privacy`, `/cookies`, `/about`, `/contact`) must be publicly accessible. Verify in `proxy.ts` that none of them appear in `PROTECTED_PATHS`.

```ts
// proxy.ts — these must NOT be in PROTECTED_PATHS
// /terms, /privacy, /cookies, /about, /contact
```

---

## 6. File Change Summary

### Files to Create

| File | Purpose |
|---|---|
| `components/marketing/legal-layout.tsx` | Shared layout wrapper for all legal/doc pages |
| `app/(public)/terms/page.tsx` | Terms of Service page |
| `app/(public)/privacy/page.tsx` | Privacy Policy page |
| `app/(public)/cookies/page.tsx` | Cookie Policy page |
| `app/(public)/about/page.tsx` | About page |
| `app/(public)/contact/page.tsx` | Contact page |

### Files to Modify

| File | Change |
|---|---|
| `components/marketing/footer.tsx` | Add links to all new pages |
| `components/marketing/navbar.tsx` | Optionally add "About" link |
| `app/globals.css` | Add `.prose-legal` styles |
| `proxy.ts` | Verify new routes are not accidentally protected |

### Files to Delete

- None

---

## 7. Accessibility Checklist

Apply to every page in this feature:

- [ ] Single `<h1>` per page
- [ ] Sequential heading hierarchy (H1 → H2 → H3, no skips)
- [ ] All body text contrast ≥7:1 (`#a0a0a0` on `#0d0d0d` = 7.04:1 ✓)
- [ ] All heading text contrast ≥4.5:1 (`#ededed` on `#0d0d0d` = 17.8:1 ✓)
- [ ] All links have descriptive text (not "click here")
- [ ] Links in body are distinguishable beyond color (underline on hover)
- [ ] TOC links are keyboard-navigable
- [ ] `id` anchors on all `<h2>` elements (for TOC and deep links)
- [ ] `scroll-margin-top` on headings to account for sticky navbar (5rem)
- [ ] Skip-to-content link inherited from marketing layout (P5-F1)
- [ ] `<main id="main-content">` is the landmark for skip link target

---

## 8. Content Notes for the Engineer

You will need to write the actual legal text. Guidelines:

1. **Do not use AI-generated boilerplate legal text verbatim.** Read a few ToS/Privacy examples from similar SaaS products (Linear, Raycast, Todoist) and write something specific to TaskFlow.
2. **Be honest about current state.** If there's no support SLA yet, don't promise one.
3. **Keep it short.** Long ToS documents nobody reads are legal risk, not legal protection. Aim for clear, honest, scannable.
4. **Get a real review before launch.** These specs provide structure and placeholder content. For production use, have the final text reviewed by someone with legal knowledge.

---

## 9. Acceptance Criteria

### Functional

- [ ] All 5 pages are accessible at their routes without authentication
- [ ] Footer links to all pages are correct and working
- [ ] TOC links scroll to the correct heading on Terms and Privacy pages
- [ ] Email links on Contact page open the mail client correctly (`mailto:`)

### Visual (manual review)

- [ ] All pages use the dark brand shell (navbar + footer from P5-F1)
- [ ] Content area is max `72ch` wide and centered
- [ ] Heading hierarchy is visually clear
- [ ] Body text is readable (not too small, sufficient line height)
- [ ] No white or light background on any page canvas
- [ ] Brand accent (`#18E299`) appears in TOC headings and links

### Quality Gates

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No TypeScript errors
- [ ] Lighthouse accessibility score ≥ 90 on each page

---

## 10. Implementation Order

| Step | Task | Estimated time |
|---|---|---|
| 1 | Create `components/marketing/legal-layout.tsx` | 30 min |
| 2 | Add `.prose-legal` styles to `app/globals.css` | 20 min |
| 3 | Build `/terms` page — structure and content | 60 min |
| 4 | Build `/privacy` page — structure and content | 45 min |
| 5 | Build `/cookies` page — structure and content | 30 min |
| 6 | Update footer with all new links | 15 min |
| 7 | Build `/about` page | 30 min |
| 8 | Build `/contact` page | 20 min |
| 9 | Verify `proxy.ts` routes | 10 min |
| 10 | Optionally update navbar | 15 min |
| 11 | Accessibility pass on all pages | 30 min |
| 12 | Run build + lint | 15 min |

---

## 11. Related Documentation

- `PRODUCT.md` — brand personality, design principles
- `DESIGN.md` — legal page layout spec (under "Components")
- `context/PRD.md` §7 — Route structure
- `AGENTS.md` — Next.js 16 App Router conventions, proxy.ts
- P5-F1 FEATURE.md — Marketing layout dependency (navbar, footer)
