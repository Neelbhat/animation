# Vantar Bio — Landing Page

Next.js 14 (App Router) + TypeScript + Tailwind CSS + GSAP/ScrollTrigger.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure

- `app/page.tsx` — renders the landing page
- `app/layout.tsx` — root layout + metadata
- `app/globals.css` — Tailwind directives
- `components/LandingEmerald.tsx` — the full landing page (hero, about, research,
  capabilities, impact stats, final CTA), all animation logic included

## Notes

- Everything animation-related lives in `LandingEmerald.tsx`: scroll reveals,
  the self-drawing lattice diagram, animated stat counters, and the hero's
  entrance timeline + parallax.
- The component is a client component (`"use client"`) since it uses refs,
  state, and GSAP — required in the Next.js App Router for anything
  interactive.
- Emerald theme only for now. If/when a second theme is needed, extract the
  color tokens into a small `theme` object/props instead of duplicating the
  whole component.
