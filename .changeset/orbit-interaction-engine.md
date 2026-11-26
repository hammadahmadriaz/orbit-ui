---
"@orbitdesign/ui": minor
---

Add the Orbit Interaction Engine and upgrade Button, Input, Card and Badge.

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
