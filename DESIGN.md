# Design

## Overview

TaskFlow brand surfaces: landing page (`/`), legal pages (`/terms`, `/privacy`, `/cookies`), and any future marketing pages. Dark-first. Raycast-influenced. Monochrome with a single sharp green accent. Inter is the committed system font; the brand surface uses it at extreme weight and scale rather than introducing a new display family — strength through commitment, not through mixing.

---

## Color

### Strategy: Restrained (dark variant)

One accent, tinted neutrals, near-black surfaces. The green `#18E299` is the only color with chroma. Everything else is achromatic.

### Tokens (mapped from `globals.css`)

| Token | Light value | Dark value | Role |
|---|---|---|---|
| `--background` | `#ffffff` | `#0d0d0d` | Page canvas |
| `--foreground` | `#0d0d0d` | `#ededed` | Primary text |
| `--card` | `#ffffff` | `#141414` | Elevated surface |
| `--muted` | `#f5f5f5` | `#262626` | Subtle fills |
| `--muted-foreground` | `#666666` | `#a0a0a0` | Secondary text |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Dividers |
| `--brand` | `#18E299` | `#18E299` | Accent (CTA, highlights, rings) |
| `--brand-deep` | `#0fa76e` | `#0fa76e` | Hover state on brand |
| `--brand-light` | `#d4fae8` | `#d4fae8` | Tinted bg behind accent text |
| `--destructive` | `#d45656` | `#d45656` | Errors |

### Brand surface palette

The public/marketing pages default to the **dark theme** (`#0d0d0d` background) regardless of the user's system preference. This is the brand statement, not a mode.

OKLCH equivalents for brand surface use (for any new tokens):
- Background: `oklch(8% 0.005 145)` — near-black with the faintest green tint
- Foreground: `oklch(95% 0.005 145)` — near-white with the faintest green tint
- Accent: `oklch(82% 0.18 155)` — `#18E299` in OKLCH

---

## Typography

### Family

**Inter** — already committed as `--font-inter`. On brand surfaces, use Inter at extreme weight and scale. The single-family decision is the voice; no display font needed.

### Scale (brand surface)

Fluid headings using `clamp()`. Minimum 1.33 ratio between steps.

| Level | Size range | Weight | Use |
|---|---|---|---|
| Hero | `clamp(3rem, 8vw, 7rem)` | 900 (Black) | Single H1 on landing |
| Display | `clamp(2rem, 5vw, 4rem)` | 800 (ExtraBold) | Section openers |
| Title | `clamp(1.25rem, 2.5vw, 1.875rem)` | 700 (Bold) | Feature titles, card heads |
| Body | `1rem` (16px) | 400 (Regular) | All body copy |
| Caption | `0.875rem` (14px) | 400–500 | Metadata, labels |
| Label | `0.75rem` (12px) | 600 | Eyebrows, tags, ALL-CAPS sparingly |

### Rules

- Line height: `1.1` for headings at hero scale; `1.5–1.6` for body
- Line length: 60–72ch for body, unconstrained for display headings
- Letter spacing: `-0.02em` to `-0.04em` on Black/ExtraBold headings (Inter tightens at large sizes)
- NO gradient text. Brand accent via weight + solid color only.

---

## Spacing

8pt grid. All spacing values are multiples of 4px (0.25rem).

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Micro gaps |
| `space-2` | 8px | Inline spacing, icon gaps |
| `space-4` | 16px | Component padding |
| `space-6` | 24px | Section internal padding |
| `space-8` | 32px | Card padding |
| `space-12` | 48px | Section gaps |
| `space-16` | 64px | Large section separations |
| `space-24` | 96px | Viewport-scale padding |
| `space-32` | 128px | Hero top padding |

---

## Radius

From `globals.css` radius scale:

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `~6px` | Tags, badges |
| `--radius-md` | `~8px` | Inputs, small buttons |
| `--radius-lg` | `10px` | Cards (base radius) |
| `--radius-xl` | `~14px` | Large cards, panels |
| `--radius-full` | `9999px` | Pills, avatar badges |

---

## Components (brand surface)

### Navigation bar

- Dark background: `#0d0d0d` with subtle bottom border `rgba(255,255,255,0.08)`
- Logo: `TaskFlow` wordmark in Inter 700 with brand green dot or checkmark glyph
- Nav links: Inter 500, `#a0a0a0`, hover `#ededed`, transition 150ms
- CTA button: filled `#18E299` background, `#0d0d0d` text, `--radius-md`, `font-weight: 600`
- Sticky on scroll with `backdrop-filter: blur(12px)` and reduced opacity background

### Hero section

- Full-viewport height on desktop, generous padding on mobile
- H1: Inter Black (900), `clamp(3rem, 8vw, 7rem)`, `#ededed`
- Subhead: Inter Regular (400), `clamp(1rem, 2vw, 1.25rem)`, `#a0a0a0`, max-width 52ch
- CTA pair: Primary (green filled) + Secondary (ghost, white border)
- Dashboard screenshot/mockup below or beside — this is the hero image
- No hero metrics template. No "10,000+ users" counters.

### Feature sections

- Alternating layout: text left + visual right, then visual left + text right
- No identical card grids. Each section has its own spatial logic.
- Use actual app screenshots or high-fidelity UI mockups, not icon + heading + text cards.

### Footer

- Dark, minimal. Logo, nav links in a single row on desktop, stacked on mobile.
- Legal links (`/terms`, `/privacy`, `/cookies`) in muted text, `#666666`
- Copyright line: `© 2025 TaskFlow. All rights reserved.`

### Legal page layout

- Full brand shell (dark navbar + footer)
- Content area: `max-width: 72ch`, centered, generous top/bottom padding
- H1: Display weight, brand-styled
- H2 section headings: Title weight, `#ededed`
- Body: `#a0a0a0` on `#0d0d0d` (WCAG AAA compliant)
- Last updated date: Caption weight, muted, top of content
- TOC sidebar on desktop for long documents (Terms, Privacy)

---

## Motion

- Brand surface: one orchestrated page-load with staggered text reveals.
  - Hero H1: fade-up, 400ms, ease-out-quart, delay 0ms
  - Hero subhead: fade-up, 400ms, ease-out-quart, delay 80ms
  - Hero CTA: fade-up, 400ms, ease-out-quart, delay 160ms
  - Dashboard preview: fade-up + scale from 0.98, 600ms, ease-out-quart, delay 240ms
- Scroll-triggered sections: fade-up + translateY(24px) → 0 as section enters viewport
- `prefers-reduced-motion`: all animations disabled, elements visible from load
- Duration range: 150ms (micro) to 600ms (hero entrance). Nothing above 600ms.

---

## Imagery

TaskFlow is a dev/productivity tool. Zero external photography needed. The hero "image" is the app's own dashboard — either a real screenshot or a high-fidelity mockup. This is the brand's strongest asset and the primary trust signal.

- Dashboard preview: dark mode, showing real task data, real UI
- Use `next/image` with `priority` for the hero asset
- Declare explicit `width` and `height` to prevent CLS

---

## Accessibility targets

- WCAG AAA: 7:1 body text contrast, 4.5:1 large text and UI
- Focus rings: `2px solid #18E299` with `2px offset`, on all interactive elements
- `prefers-reduced-motion`: disable all entrance animations
- Skip-to-content link at page top (visible on focus)
- Heading hierarchy: one H1 per page, sequential H2/H3
- No color as sole information carrier
