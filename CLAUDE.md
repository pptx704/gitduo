# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitDuo is a GitHub client with Duolingo-inspired UI/UX. Built with SvelteKit, Svelte 5, TypeScript, and vanilla CSS. Uses bun as the package manager and runtime.

## Commands

```bash
# Activate nvm first (not auto-loaded)
source ~/.nvm/nvm.sh

bun run dev          # Start dev server (Vite)
bun run build        # Production build
bun run preview      # Preview production build
bun run check        # TypeScript + Svelte type checking
bun run check:watch  # Type checking in watch mode
```

No test runner or linter configured yet.

## Architecture

**SvelteKit** with file-based routing. All routes under `src/routes/`. Layout uses a fixed sidebar on desktop, hamburger menu on mobile (768px breakpoint).

**Svelte 5 runes** are enforced project-wide via `svelte.config.js`. Use `$state()`, `$props()`, `$derived()`, and `{@render children()}` — not legacy `export let` or `<slot>`.

**Component props pattern:**
```typescript
interface Props {
  variant?: 'primary' | 'secondary';
  children: Snippet;
}
let { variant = 'primary', children }: Props = $props();
```

**Stores** use Svelte `writable` with TypeScript interfaces and exported action functions (not methods on store objects).

**CSS approach:** No framework. Scoped `<style>` blocks per component. Design tokens (colors, spacing, typography, shadows) defined as CSS custom properties in `src/lib/styles/variables.css`. Global reset and font loading in `src/lib/styles/global.css`.

**Exports:** Reusable components are barrel-exported from `src/lib/index.ts`, imported via `$lib`.

## Design System

Duolingo aesthetic: Nunito font (extrabold), 3D button shadows with press animation, rounded borders, bright color palette. Primary green `#58CC02`, secondary blue `#1CB0F6`, warning orange `#FF9600`, danger red `#FF4B4B`. All tokens are `--duo-*` CSS variables.

## Design Context

### Users
Proof-of-concept stage. No locked-in user segment yet — building to demonstrate a gamified GitHub client concept. Design should appeal broadly to developers who'd enjoy a friendlier, more motivating interface for GitHub.

### Brand Personality
**Playful, productive, clear.**
Duolingo's charm grounded in getting work done. Gamification serves productivity, not distraction. Celebrates small wins without feeling like a toy. The interface should feel capable and polished — a real tool with personality, not a novelty.

### Aesthetic Direction
- **Visual tone:** Bright, rounded, bold — Duolingo's signature look applied to developer tooling
- **References:** Duolingo (color palette, 3D buttons, extrabold type, streaks/achievements), with GitHub's information architecture underneath
- **Anti-references:** GitHub/GitLab (no dense tables, monochrome palettes, enterprise patterns — the whole point is to be different). Also not childish/toy-like — should feel polished and capable despite the playful aesthetic
- **Theme:** Light mode only. Duolingo is light mode; GitDuo follows suit
- **Typography:** Nunito extrabold as primary. Uppercase labels with letter-spacing for UI chrome
- **Motion:** Smooth, purposeful transitions. Press effects on buttons, lift on hover. Celebratory animations for achievements/milestones
- **Depth:** Flat design with selective 3D — bottom-border shadows on buttons and interactive elements, hover lifts on cards. No drop shadows or skeuomorphism

### Design Principles

1. **Gamify without trivializing.** Streaks, badges, and progress bars motivate — but the underlying tool must feel competent. Every gamification element should map to a real developer action.

2. **Bright beats dense.** Prefer whitespace and bold color over information density. One clear action per screen section. If a layout feels like a dashboard, simplify it.

3. **Depth through interaction.** 3D button presses, card lifts, progress fills — depth comes from how things respond to touch, not from static shadows or gradients.

4. **Consistent tokens, scoped styles.** All colors, spacing, radii, and typography flow from `--duo-*` CSS variables. Components use scoped `<style>` blocks. No utility classes, no CSS framework.

5. **Mobile-aware, not mobile-first.** Desktop sidebar layout is primary. Mobile gets a clean hamburger-drawer adaptation at 768px. Don't over-optimize for mobile at PoC stage.
