---
"@orbitdesign/ui": minor
---

Interaction engine for Modal, Dropdown, Tabs and Tooltip.

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
