# Design Tokens: Learn English App

**Source of truth**: `src/index.css` `@theme` block
**Feature**: 003-ui-design-refresh
**Last updated**: 2026-02-21

All tokens are CSS custom properties consumed via `var(--token-name)` in inline styles or Tailwind utility classes (e.g., `bg-primary`, `text-text-muted`).

---

## Color Tokens

### Brand Colors

| Token | Value | Tailwind Equivalent | Usage |
|-------|-------|---------------------|-------|
| `--color-primary` | `#4f46e5` | indigo-600 | Interactive elements: buttons, links, active states |
| `--color-primary-dark` | `#4338ca` | indigo-700 | Hover states; text on white requiring strong contrast |
| `--color-primary-light` | `#e0e7ff` | indigo-100 | Subtle backgrounds, pill badges |
| `--color-background` | `#F8FAFC` | slate-50 | App background |
| `--color-card` | `#FFFFFF` | white | Card surfaces |
| `--color-text` | `#1E293B` | slate-800 | Primary body text |
| `--color-text-muted` | `#64748B` | slate-500 | Secondary/muted labels |

### Semantic Colors

| Token | Value | Tailwind Equivalent | Usage |
|-------|-------|---------------------|-------|
| `--color-success` | `#059669` | emerald-600 | Correct answers, success states |
| `--color-error` | `#dc2626` | red-600 | Error states, wrong answers, PIN shake |
| `--color-warning` | `#ca8a04` | yellow-600 | Sync warnings, offline banners |

### Category Accent Colors

All pass WCAG 2.1 AA: ≥4.5:1 contrast as text on white; ≥3:1 as colored background on white.

| Token | Value | Tailwind Equivalent | Categories |
|-------|-------|---------------------|------------|
| `--color-cat-yellow` | `#ca8a04` | yellow-600 | Greetings, Time |
| `--color-cat-red` | `#dc2626` | red-600 | Food & Drinks |
| `--color-cat-purple` | `#7e22ce` | purple-700 | Numbers |
| `--color-cat-fuchsia` | `#c026d3` | fuchsia-600 | Colors |
| `--color-cat-emerald` | `#059669` | emerald-600 | Family |
| `--color-cat-blue` | `#1d4ed8` | blue-700 | School |
| `--color-cat-cyan` | `#0e7490` | cyan-700 | Travel |
| `--color-cat-orange` | `#ea580c` | orange-600 | Shopping |
| `--color-cat-teal` | `#0f766e` | teal-700 | Common Verbs |

**Usage pattern** (category colors stored as CSS variable names in `vocabulary.ts`):
```tsx
// Solid color
style={{ backgroundColor: `var(${category.color})` }}

// Tinted background (15% opacity)
style={{ backgroundColor: `color-mix(in srgb, var(${category.color}) 15%, transparent)` }}

// Border accent
style={{ borderTop: `4px solid var(${category.color})` }}
```

---

## Typography Scale

4-level hierarchy — all Tailwind utility classes, no custom CSS.

| Level | Tailwind Classes | Use Cases |
|-------|-----------------|-----------|
| **Display** | `text-3xl font-bold text-slate-900` | Screen titles, results score, greeting headline |
| **Heading** | `text-xl font-semibold text-slate-800` | Section headers, category names, card titles |
| **Body** | `text-base font-normal text-slate-700` | Instructions, descriptions, content text |
| **Muted** | `text-sm text-slate-500` | Helper text, stat sub-labels, timestamps |

---

## Spacing Conventions

Tailwind's 4px base scale. No custom tokens — use the built-in scale consistently:

| Context | Value | Tailwind |
|---------|-------|---------|
| Section gap (major) | 32px | `gap-8` / `space-y-8` |
| Card internal padding | 16px | `p-4` |
| Component gap (minor) | 12px | `gap-3` / `space-y-3` |
| Text element gap | 8px | `gap-2` / `space-y-2` |
| Touch target minimum | 44×44px | `min-h-11 min-w-11` |

---

## Border Radius Scale

| Context | Value | Tailwind |
|---------|-------|---------|
| Cards / modals | 12px | `rounded-xl` |
| Buttons (primary) | 10px | `rounded-lg` |
| Pills / badges | full | `rounded-full` |
| Input fields | 8px | `rounded-lg` |

---

## Animation Tokens

Defined as `--animate-*` in `@theme`; Tailwind auto-generates `animate-*` utility classes.
**Rule**: All keyframes use only `transform` and/or `opacity`. No exceptions.

| Token | Duration | Easing | Use Case |
|-------|----------|--------|---------|
| `--animate-fade-in` | 300ms | ease-out | Screen and section entrance |
| `--animate-slide-up` | 300ms | ease-out | Card and content entrance |
| `--animate-bounce-in` | 500ms | cubic-bezier(0.68,-0.55,0.265,1.55) | Success celebrations |
| `--animate-shake` | 400ms | ease-in-out | Error feedback (PIN wrong answer) |
| `--animate-flip` | 600ms | ease-in-out | Flashcard flip |
| `--animate-shimmer` | 1800ms | linear infinite | Skeleton loading placeholders |

### Usage guidelines

```tsx
// Entrance animations — always use motion-safe: variant
<div className="motion-safe:animate-fade-in">
<div className="motion-safe:animate-slide-up">

// Celebration — always use motion-safe: variant
<div className="motion-safe:animate-bounce-in">

// Error feedback — NO motion-safe: (must work even with reduce-motion)
<div className="animate-shake">

// Shimmer skeleton — used on ::after pseudo-element via CSS, not Tailwind class
// See SkeletonCard.tsx for implementation pattern
```

### Reduced-motion behavior

- `motion-safe:animate-*` classes are suppressed automatically by Tailwind when `prefers-reduced-motion: reduce`
- `animate-shake` intentionally remains active (it is functional error feedback, not decoration)
- `animate-fade-in`, `animate-slide-up`, `animate-bounce-in`, `animate-flip`, `animate-shimmer` are also suppressed via CSS `@media (prefers-reduced-motion: reduce)` block in `index.css`

---

## Screen State Model

Each of the 5 student-facing screens (Login, Dashboard, Category, Game, Results) has 4 defined states:

| Screen | Loading | Empty | Populated | Error |
|--------|---------|-------|-----------|-------|
| **Login** | Spinner in submit button | — | Clean PIN input | Red border + shake + message |
| **Dashboard** | 6 SkeletonCards + shimmer stats | EmptyState component + CTA | Category cards with progress | Yellow sync error banner |
| **Category** | Skeleton stats + skeleton game cards | "—" stats + "No games played yet" | Stats + game option cards | Inline error below stats |
| **Game** | Centered spinner | — | Active game UI | Red feedback + message |
| **Results** | — | — | Staggered entrance + animated XP | Yellow save-error banner |

---

## Component Contracts

### CategoryCard (`src/components/CategoryCard.tsx`)

| Prop | Type | Description |
|------|------|-------------|
| `category` | `Category` | Full category object from vocabulary.ts |
| `progress` | `number` | 0–100 percentage of words seen |
| `wordsLearned` | `number` | Absolute count of words learned |
| `totalWords` | `number` | Total words in category |
| `color` | `string` | CSS variable name e.g. `--color-cat-yellow` |
| `onClick` | `() => void` | Navigation handler |

Visual tiers: `wordsLearned === 0` → "Not started" (15% tint background); `0 < wordsLearned < total` → progress bar; `wordsLearned === total` → ✓ completion badge.

### SkeletonCard (`src/components/SkeletonCard.tsx`)

Stateless. No props. Matches `CategoryCard` dimensions exactly. Uses shimmer gradient via `::after` pseudo-element.

### EmptyState (`src/components/EmptyState.tsx`)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `string` | ✓ | Emoji string |
| `title` | `string` | ✓ | Display-level headline |
| `description` | `string` | ✓ | Body-level description |
| `actionLabel` | `string` | — | Primary CTA button text |
| `onAction` | `() => void` | — | CTA click handler |
