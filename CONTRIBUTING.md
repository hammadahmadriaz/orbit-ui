# Contributing to Orbit UI

## Setup

```bash
pnpm install
pnpm dev        # builds the library in watch mode and starts the docs on http://localhost:3000
```

## Repo layout

```
packages/ui/                 the npm package "@orbitui/ui"
  src/css/themes.css         color and radius tokens, all themes
  src/css/components/*.css   one file per component (Tailwind @utility)
  src/css/index.css          entry point, imports everything
  src/react/components/*.tsx React wrappers
  src/react/index.ts         React entry point ("@orbitui/ui/react")
  test/                      Vitest + Testing Library
apps/docs/                   documentation site (Next.js + Fumadocs)
  content/docs/              MDX pages, one per component
  components/preview.tsx     the live preview box with theme switcher
  components/demos.tsx       interactive demos that need React state
scripts/new-component.mjs    component generator
```

## Adding a component

```bash
pnpm new:component tooltip
```

This creates four files and registers the component in both index files:

1. `packages/ui/src/css/components/tooltip.css`
2. `packages/ui/src/react/components/tooltip.tsx`
3. `packages/ui/test/tooltip.test.tsx`
4. `apps/docs/content/docs/components/tooltip.mdx`

Then design it, run `pnpm dev`, and check the docs page while you work.

## Rules every component follows

**1. Base class reads, modifiers write.**
The base class uses private variables with fallbacks. Modifier classes only set those variables. This is why `btn btn-primary btn-outline btn-lg` works in any order.

```css
@utility btn {
  background-color: var(--btn-bg, var(--btn-color, var(--color-base-200)));
}
@utility btn-primary {
  --btn-color: var(--color-primary);
}
```

**2. Only use theme tokens for colors.**
Use `var(--color-primary)`, `var(--color-base-300)` and so on. Never hard code a color, or the component will break in other themes. Use `color-mix()` for tints.

**3. Full class strings in React.**
Tailwind scans files as plain text. Write `"btn-primary"`, never `` `btn-${color}` ``, or the class will not be generated.

**4. Native elements first.**
Use `<button>`, `<dialog>`, `<input>`, `<details>` before reaching for JavaScript.

**5. Every React component** forwards its ref, merges `className` with `cx()`, and spreads remaining props onto the element.

## Releasing

We use [Changesets](https://github.com/changesets/changesets).

```bash
pnpm changeset   # pick patch / minor / major and describe the change
```

Commit the generated file with your PR. When it is merged to `main`, the Release workflow opens a "Version Packages" PR. Merging that PR publishes to npm.

Version rules:
- **patch**: bug fix, no API change
- **minor**: new component, new prop, new class
- **major**: renamed or removed class, prop or token
