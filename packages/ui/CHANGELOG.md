# @orbitdesign/ui

## 0.2.0

### Minor Changes

- 8b4557a: Interaction engine for Modal, Dropdown, Tabs and Tooltip.
  
  - Modal: system window open and close (point, line, full window in holo), animated close in
    every browser, holo backdrop with vignette and grid, page scroll lock with nested modal
    support (`lockScroll`), engine props.
  - Dropdown: unfolds from the trigger in holo, exit animation, bracket and sweep highlight,
    typeahead, `shortcut` prop and `menu-shortcut` class, engine props.
  - Tabs: sliding indicator for line, boxed and pill (`tabs-animated`, `tabs-indicator`), holo
    energy head, panel transition in enhanced and holo, engine props.
  - Tooltip: `delay` prop (`--tt-delay`), Escape to dismiss (WCAG 1.4.13), holo readout reveal,
    engine props.
  - Fix: `btn-square` and `btn-circle` combined with a size class (for example `btn-sm`) got
    horizontal padding back, which squeezed icons in icon buttons, the modal close button and
    the toast close button.
- 9c725a1: Add five components: Tabs, Tooltip, Progress (with RadialProgress), Dropdown and Toast.
  Add the futuristic `hud` theme with automatic glow, HUD effects (`hud-frame`, `hud-scan`,
  `hud-grid`, `hud-glow`, `text-glow`, `clip-corner`), an orbit spinner variant, and GSAP style
  CSS animations (`animate-*`, `anim-delay-*`, `stagger`, `reveal`).
- d097822: Add the Orbit Interaction Engine and upgrade Button, Input, Card and Badge.
  
  - Engine: `data-orbit-mode` with `standard` (default, unchanged look), `enhanced`, `holo` and
    `custom` modes, public `--orbit-*` tokens, reduced motion handling, and the React
    `OrbitProvider`, `useOrbit`, `orbitVars` and shared `InteractionProps` (`mode`, `glow`,
    `effects`, `motion`). The `hud` theme now uses `holo` by default.
  - Button: energy line, press wave from the press point, focus target lock, charge bar while
    loading, lift in enhanced mode, new `radius` prop and `btn-loading` class.
  - Input: focus line, focus scan, error shake and success pulse, new `status`, `prefix`,
    `suffix` and `radius` props, `input-bare` and `input-addon` classes. Textarea accepts `status`.
  - Card: pointer ambient light, HUD corner indicators, tilt, elevation scale. New `elevation`,
    `framed`, `interactive` and `radius` props, `card-raised`, `card-floating`, `card-framed`,
    `card-interactive` classes. `CardTitle` accepts `as` for the heading level.
  - Badge: new `pulse` and `dot` props (`badge-pulse`, `badge-dot`).
  - `--oui-glow` still works as a deprecated alias of `--orbit-glow`.
