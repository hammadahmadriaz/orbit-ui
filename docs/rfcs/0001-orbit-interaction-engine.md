# RFC 0001: Orbit Interaction Engine

| | |
| --- | --- |
| Status | Accepted. Step 1 and group A implemented in 0.3.0 |
| Author | Orbit UI maintainers |
| Target version | `@orbitdesign/ui` 0.3.0 (minor, no breaking changes) |
| Scope | Audit of the current library, interaction engine architecture, component behaviour specs, rollout plan |

---

## 1. Summary

Orbit UI today is a styled component library with one futuristic theme (`hud`). This RFC turns it into a library with an **interaction engine**: a small, CSS-first system that controls how every component moves, lights up and reacts, with four modes (`standard`, `enhanced`, `holo`, `custom`) that can be set globally, per component type, or per instance.

The engine is mostly CSS custom properties and attribute selectors. JavaScript is used only for five interactions that need it (pointer position, measured indicators, timers, scroll lock, Escape handling). It adds no runtime dependency and works with server rendering.

---

## 2. Audit of the current codebase

Verified against the code in `main` at `0982bba`, not against the docs.

### 2.1 Architecture

```
packages/ui            npm package @orbitdesign/ui (0.1.0 published, 0.2.0 pending in a changeset)
  src/css/themes.css   tokens in @theme (light) + data-theme overrides: dark, hud, corporate, forest
  src/css/components   one file per component, every class written as a Tailwind v4 @utility
  src/css/index.css    entry, plus @source "../../dist/react" so Tailwind sees classes used in React
  src/react            14 component files, 1,230 lines, zero runtime dependencies
  dist/react           tsup output: ESM + CJS + d.ts, one bundle, "use client" banner
apps/docs              Next.js 16 + Fumadocs, static export to GitHub Pages
```

| Metric | Value |
| --- | --- |
| React bundle | 30.3 KB raw, 7.2 KB gzip (all components) |
| CSS with every class used | 9.8 KB gzip including Tailwind preflight |
| CSS utilities defined | 185 |
| Tests | 25 (Vitest + Testing Library), all passing |
| Runtime dependencies | 0 (React is a peer) |

**What works well and must be kept**

- The "base class reads, modifiers write" variable pattern. It makes color, variant and size classes combine in any order without specificity fights.
- Classes are real Tailwind utilities, so `hover:btn-primary` and `md:btn-lg` work, and unused components cost zero bytes.
- Native elements first: `<dialog>`, `<progress>`, `<input type="checkbox">`, `<details>`.
- CSS and React APIs are aligned: every React prop maps to a class.

### 2.2 Existing component capabilities

| Component | Variants | Sizes | States | JS behaviour today |
| --- | --- | --- | --- | --- |
| Button | 8 colors, solid/outline/soft/ghost/link | xs to xl | loading, disabled | `asChild` |
| Badge | 8 colors, solid/soft/outline | sm to lg | none | none |
| Card | compact, flat, side | none | none | none |
| Input, Textarea, Select, Field | 7 colors, ghost | sm to lg | invalid via Field error | aria wiring in Field |
| Alert | 4 statuses, soft/solid/outline | none | none | default icons |
| Modal | sm/md/lg/full | widths | open | native dialog, backdrop click, Escape |
| Avatar | square | xs to xl | image error fallback | initials |
| Checkbox, Toggle | 6 colors | sm to lg | indeterminate | none |
| Spinner | default, orbit | xs to lg | none | none |
| Tabs | line/boxed/pill, 4 colors | sm to lg | disabled tab | roving focus, arrow keys |
| Tooltip | 4 sides, 7 colors | none | open | aria-describedby |
| Progress, RadialProgress | 8 colors, striped | xs to lg | indeterminate | none |
| Dropdown | start/end, top/bottom | none | disabled item | outside click, Escape, arrow keys |
| Toast | 6 positions | none | closing | timers, limit |

### 2.3 Existing HUD implementation

- One global knob, `--oui-glow` (0 or 1), set by the `hud` theme. Button, Badge, Card, Toggle, Tabs, Tooltip, Progress, Dropdown and Toast multiply their box-shadow by it.
- Utilities: `hud-frame`, `hud-scan`, `hud-grid`, `hud-glow`, `text-glow`, `clip-corner`, `spinner-orbit`.
- Animations: 14 keyframes exposed as `animate-*`, plus `anim-delay-*`, `stagger`, `reveal` (scroll driven).

**Problem:** the futuristic look is tied to a color theme. You cannot have a light theme with futuristic behaviour, or the hud colors with calm behaviour. Every component reacts the same way (a glow), which is exactly the "generic glow" the product vision wants to avoid.

### 2.4 Missing component features

| Component | Missing |
| --- | --- |
| Button | press feedback from pointer position, futuristic loading indicator, scanning border option |
| Input | success state, animated focus indicator, prefix/suffix slots, clear button |
| Card | interactive mode, pointer reactive light and tilt, elevation scale, built-in corner indicators |
| Modal | scroll lock on body, exit transition is CSS only (works in Chromium and Safari, instant in Firefox) |
| Checkbox, Toggle | `label` and `description` props, activation feedback |
| Tabs | animated active indicator that slides between tabs |
| Toast | pause on hover and on focus, swipe or Escape to dismiss, progress of remaining time |
| Alert | dismissible, actions slot |
| Avatar | status dot, loading state while the image downloads |
| Badge | pulse, dot variant |
| Tooltip | delay prop, Escape to dismiss |
| Progress | visible label and value text option |
| Spinner | speed control, more styles, reduced motion alternative for the orbit style |
| Dropdown | typeahead, checkbox and radio items, animated highlight |

### 2.5 Performance findings

1. `hud-scan`, `animate-glitch`, `animate-float`, striped and indeterminate progress run `infinite` animations even when off screen. They animate `transform` and `background-position`; the first is cheap, the second repaints. Fix: pause with `animation-play-state` when the element is hidden, and use `transform` based stripes.
2. Modal backdrop uses `backdrop-filter: blur()`, which is expensive on low end devices. Fix: only in `enhanced` and `holo` modes, and disabled under `prefers-reduced-transparency`.
3. Glow is a `box-shadow` that transitions on hover. Box shadow transitions repaint. Fix: draw glow on a pseudo-element and animate its `opacity` (compositor only).
4. No JavaScript animation loops exist today. Keep it that way: the engine uses `requestAnimationFrame` only while the pointer is moving over an interactive card, and stops immediately.

### 2.6 Accessibility gaps

| Gap | WCAG | Fix |
| --- | --- | --- |
| Tooltip cannot be dismissed with Escape | 1.4.13 | Escape listener while open |
| Toast does not pause on hover or focus | 2.2.1 | pause timers on pointer enter and focus within |
| Modal does not lock page scroll | usability | scroll lock with scrollbar gutter compensation |
| Checkbox and Toggle have no label prop, easy to ship unlabeled | 4.1.2 | `label` prop and dev warning when no accessible name |
| `hud-scan` and `animate-*` respect reduced motion, but spinner, striped and indeterminate progress do not | 2.3.3 | engine sets motion tokens to zero under reduced motion, spinners get a calm alternative |
| No automated accessibility tests | | add axe checks to the test suite |

### 2.7 API inconsistencies

| Issue | Today | Proposal (non breaking) |
| --- | --- | --- |
| Size prop on inputs | `inputSize` | keep, and add `size` alias where it does not clash with the native attribute (Select, Textarea) |
| Status vs color | Alert and Toast use `status`, others `color` | keep `status` for semantic components, document why |
| Color sets differ | Checkbox lacks `neutral`/`info`, Tooltip lacks `neutral` | align every component to the full `Color` type where it makes sense |
| Size scales differ | Spinner xs to lg, Button xs to xl | allow xl everywhere sizes exist |
| Variable prefixes | `--btn-`, `--tt-`, `--dd-`, `--oui-`, `--frame-` mixed, public and private not separated | public engine variables become `--orbit-*`; component variables keep their names and get documented; old `--oui-glow` stays as an alias |

### 2.8 Backward compatibility risks

- Renaming classes (for example `btn` to `orbit-button`) would break every user. **Not proposed.** Existing classes stay.
- Changing default visuals of `light`, `dark`, `corporate`, `forest` would surprise users. **Default mode is `standard`, which renders exactly like 0.2.0.**
- `hud` theme users currently get glow automatically. The `hud` theme will default to `holo` mode, so they get the same or richer behaviour.

---

## 3. Architecture: the Orbit Interaction Engine

### 3.1 Principles

1. **CSS first.** A mode is a set of CSS custom property values. Components read them. No branching in JavaScript.
2. **Independent from color themes.** `data-theme` controls colors, `data-orbit-mode` controls behaviour. Any combination works.
3. **Zero cost when off.** In `standard` mode, effect layers are not rendered (`display: none` on effect pseudo-elements, effect props resolve to `0`).
4. **JS only for real interactions.** Listed in 3.6.
5. **Predictable overrides** through the normal CSS cascade (see 3.5).

### 3.2 Modes

| Mode | Motion | Feedback | Effects |
| --- | --- | --- | --- |
| `standard` | 120ms, simple ease | color changes only | none |
| `enhanced` | 180ms, smooth ease out | lift, depth shadow, press scale | depth, soft focus ring animation |
| `holo` | 220ms, custom curve | component specific (see section 4) | glow, scan, energy, ambient light, holographic layers |
| `custom` | developer defined | developer defined | each effect toggled and tuned individually |

Set a mode anywhere in the tree, like a theme:

```html
<html data-theme="dark" data-orbit-mode="holo">
  <section data-orbit-mode="standard">calm area inside a jarvis page</section>
</html>
```

### 3.3 Engine tokens (public)

These are the only engine variables users need to know. Every one gets documented.

| Variable | Type | standard | enhanced | holo | Meaning |
| --- | --- | --- | --- | --- | --- |
| `--orbit-duration` | time | 120ms | 180ms | 220ms | base transition time |
| `--orbit-ease` | easing | ease | cubic-bezier(.2,.8,.2,1) | cubic-bezier(.16,1,.3,1) | base easing |
| `--orbit-intensity` | 0 to 1 | 0 | 0.5 | 1 | master strength of all effects |
| `--orbit-glow` | 0 to 1 | 0 | 0 | 0.6 | glow strength (replaces `--oui-glow`) |
| `--orbit-depth` | 0 to 1 | 0 | 0.6 | 0.8 | elevation and lift |
| `--orbit-scan` | 0 or 1 | 0 | 0 | 1 | scanning effects on or off |
| `--orbit-energy` | 0 or 1 | 0 | 0 | 1 | energy and charge effects |
| `--orbit-ambient` | 0 or 1 | 0 | 0 | 1 | pointer reactive ambient light |
| `--orbit-holo` | 0 or 1 | 0 | 0 | 1 | holographic layers (cards, modals) |
| `--orbit-press` | scale | 1 | 0.97 | 0.96 | press scale |

`custom` mode is simply: start from `standard` and set any of these.

Under `prefers-reduced-motion: reduce`, the engine forces `--orbit-duration: 0ms`, `--orbit-scan: 0`, `--orbit-energy: 0`, `--orbit-ambient: 0`, while keeping static glow and depth (they are not motion).

### 3.4 React API

```tsx
import { OrbitProvider, Button } from "@orbitdesign/ui/react";

<OrbitProvider
  mode="holo"                       // global
  theme="dark"                        // optional, sets data-theme
  effects={{ glow: 0.5, scan: false }}
  motion={{ duration: 200 }}
  components={{
    Button: { mode: "enhanced" },     // per component type
    Card: { effects: { holo: true } },
  }}
>
  <Button mode="holo" glow={0.8}>Engage</Button>   {/* per instance */}
</OrbitProvider>
```

Shared, strongly typed props (only on components where they mean something):

```ts
type OrbitMode = "standard" | "enhanced" | "holo" | "custom";

interface OrbitEffects {
  glow?: boolean | number;   // number = intensity 0..1
  scan?: boolean;
  energy?: boolean;
  ambient?: boolean;
  holo?: boolean;
  depth?: boolean | number;
}

interface OrbitMotion {
  duration?: number;         // ms
  easing?: string;
  delay?: number;            // ms
}

interface InteractionProps {
  mode?: OrbitMode;
  effects?: OrbitEffects;
  motion?: OrbitMotion;
  glow?: boolean | number;   // shortcut for effects.glow, the most used option
}
```

Implementation: one hook, `useOrbit(componentName, props)`, merges provider config, component defaults and instance props, and returns `{ "data-orbit-mode", style }` with CSS variables. It renders the same output on server and client, so there are no hydration mismatches. No state, no effects.

`OrbitProvider` renders a `display: contents` wrapper with the data attributes, or applies them to `<html>` with `target="html"` (done in a layout effect only for that option, with the server side value set through the layout).

**Props intentionally not added:** `width`, `height`, `padding`, `fontSize`, `lineHeight`, `letterSpacing`, `background`, `opacity`. Tailwind classes already do these better (`w-64`, `px-6`, `text-sm`), and duplicating them as props would create two ways to do the same thing. `radius` is added because it maps to a token (`--radius-field`/`--radius-box`) and is commonly themed per instance.

### 3.5 Override precedence

Resolved by the CSS cascade, from weakest to strongest:

1. Library defaults (`:root` engine tokens, component fallbacks)
2. Theme tokens (`[data-theme]`)
3. Mode (`[data-orbit-mode]`) and global provider config (wrapper attributes and variables)
4. Component defaults from the provider (merged into props by `useOrbit`)
5. Instance props (inline CSS variables on the element)
6. Explicit `style` prop (merged after instance variables, so it wins)

`className` utilities that set a property directly (for example `rounded-full`) always win over component styles, as today. A `className` that sets an engine variable (`[--orbit-glow:1]`) loses against an instance prop for the same variable, because inline styles beat classes. This is documented with an example.

### 3.6 Where JavaScript is used

| Interaction | Why CSS is not enough | Cost |
| --- | --- | --- |
| Card ambient light and tilt | needs pointer coordinates | `pointermove` sets two variables in one rAF, only when `ambient` is on, pointer is fine and motion is allowed |
| Button energy press | needs press origin | one `pointerdown` handler sets two variables |
| Tabs sliding indicator | needs active tab position | measured on change and with one shared `ResizeObserver`, CSS does the animation |
| Toast pause on hover/focus | timers | existing timers, paused and resumed |
| Modal scroll lock, Tooltip Escape | document level behaviour | listeners only while open |

Everything else, including glow, scan, energy lines, holographic layers and entrance animations, is CSS.

### 3.7 CSS structure

```
src/css/engine.css          tokens per mode, reduced motion rules, shared effect layers
src/css/components/*.css    each component reads engine tokens and adds its own holo behaviour
```

Component holo behaviour is written with zero specificity selectors so users can always override it:

```css
:where([data-orbit-mode="holo"]) .btn::after { /* scanning border */ }
```

Effect layers use pseudo-elements and animate only `opacity` and `transform`.

---

## 4. Component behaviour specs (holo mode)

Each component gets its own personality. No component simply "glows".

| Component | Signature behaviour |
| --- | --- |
| **Button** | Charge: on hover an energy line travels along the bottom edge; on press a pulse expands from the pointer position; `loading` shows a segmented charge bar inside the button instead of a spinner; optional `scan` runs a light around the border once on focus. |
| **Input** | System boot focus: a focus line draws from the left; a short scan passes through the field on first focus; success shows a check pulse on the right edge, error a brief horizontal shake plus a red underline. New: `status="success" \| "error"`, `prefix`, `suffix`. |
| **Card** | Holographic surface: corner indicators fade in on hover, ambient light follows the pointer, optional 2 to 3 degree tilt, layered depth (content floats above a faint grid). New: `interactive`, `elevation`. |
| **Modal** | System window: opens with a horizontal line that expands vertically into the window, backdrop gets a faint vignette and grid, closes in reverse. Scroll lock added in all modes. |
| **Dropdown** | Targeting list: menu unfolds from the trigger edge, highlighted item gets a sliding bracket indicator, typeahead added. |
| **Checkbox / Toggle** | Activation: checkbox draws its check with a stroke animation and a short ring burst; toggle knob leaves an energy trail and the track fills like a charge. New: `label`, `description`. |
| **Tabs** | Energy line: active indicator slides between tabs, with a brief bright head at the leading edge. Works in all modes (plain slide in standard). |
| **Toast / Alert** | Transmission: toast enters with a scan line from the top, shows a thin countdown bar, pauses on hover and focus. Alert gets `dismissible` and a short decode in on mount. |
| **Progress** | Energy flow: the bar has a moving highlight at the leading edge, radial gauge gets tick marks; new `showValue` and `label`. |
| **Spinner** | New styles: `orbit` (existing), `pulse`, `bars`, `ring`; `speed` prop; reduced motion shows a static segmented ring with a slow opacity pulse. |
| **Avatar** | Presence: `status="online" \| "busy" \| "away" \| "offline"` dot with a soft breathing halo in holo; skeleton shimmer while the image loads. |
| **Badge** | Signal: `pulse` prop for live states, `dot` variant. |
| **Tooltip** | Readout: appears with a 1 line "type in" reveal, `delay` prop, Escape dismiss. |

---

## 5. Customization model (shadcn style freedom)

Ten levels, all supported:

1. Props (`variant`, `color`, `size`, `mode`, `glow`)
2. `className` (any Tailwind utility)
3. `style`
4. CSS variables (engine tokens and documented component variables)
5. Custom themes (`[data-theme="brand"] { ... }`)
6. Custom variants (`@utility btn-gradient { ... }`, documented pattern)
7. Custom interaction presets (`[data-orbit-mode="calm"] { --orbit-duration: 300ms; ... }` plus `mode="custom"` in React)
8. Global provider configuration
9. Per component configuration (`components` in the provider)
10. Per instance overrides

Every public variable is listed in a "CSS variables" table on its component page. Variables not in a table are private and may change.

---

## 6. Documentation and playground

- Every component page: a mode switcher (standard, enhanced, jarvis) next to the existing theme switcher in each preview, plus sections for variants, sizes, props, HTML, custom styling, CSS variables, interaction config and accessibility.
- New `/playground` page built with the real components: pick component, mode, theme, variant, size, glow, speed, radius, toggle each effect, and copy the generated React and CSS.

---

## 7. Testing plan

- Rendering, variants, sizes for every component (extend current tests).
- `useOrbit` precedence tests: provider, component defaults, instance, style.
- SSR: `renderToString` for every component, compared with client render (no mismatch).
- Reduced motion: `matchMedia` mocked, JS effects must not attach listeners.
- Accessibility: axe checks on every component in every mode.
- Keyboard: existing tests plus Tooltip Escape, Toast pause, Modal scroll lock.
- Backward compatibility snapshot: the class output of every 0.2.0 example must stay identical in `standard` mode.

---

## 8. Rollout plan

| Step | Content | Release |
| --- | --- | --- |
| 1 | Engine: `engine.css`, tokens, `OrbitProvider`, `useOrbit`, shared types, reduced motion, tests | 0.3.0 |
| 2 | Group A: Button, Input, Card, Badge | 0.3.0 |
| 3 | Group B: Modal, Dropdown, Tabs, Tooltip | 0.4.0 |
| 4 | Group C: Checkbox/Toggle, Toast/Alert, Progress, Spinner, Avatar | 0.4.0 |
| 5 | Docs mode switcher on every page and the playground | with each step |
| 6 | Vue and Angular packages on top of the same CSS engine | 0.5.0 |

Each step ends with a report: what changed, files, new APIs, tests run, build status, open issues. A changelog entry is added through Changesets for every step.

**Migration:** none required. `--oui-glow` keeps working as an alias of `--orbit-glow` until 1.0 and is marked deprecated in the docs.

---

## 9. Decisions

1. The futuristic mode is called **`holo`** (original name, no trademark risk). Docs and marketing may say it is inspired by film HUD interfaces.
2. Modes and themes are independent. The `hud` theme uses `holo` unless a mode is set.
3. Plan approved. Implementation follows the steps in section 8.
