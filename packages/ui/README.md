# Orbit UI

A Tailwind CSS v4 component library. Semantic classes that work in any framework, typed React components and built-in themes.

```html
<button class="btn btn-primary">Save</button>
```

```tsx
import { Button } from "@orbitdesign/ui/react";

<Button color="primary">Save</Button>
```

## Install

```bash
npm i @orbitdesign/ui
```

Add it to the CSS file where you import Tailwind:

```css
@import "tailwindcss";
@import "@orbitdesign/ui";
```

That is all. Use the classes anywhere, or import React components from `@orbitdesign/ui/react`.

## Features

- **Any framework.** Classes like `btn`, `card` and `badge` work in React, Vue, Svelte, Astro, Blade or HTML.
- **Typed React components.** Optional, zero dependencies, forwarded refs, `"use client"` ready for Next.js.
- **Themes.** `light`, `dark`, `hud`, `corporate` and `forest` built in. Switch with `<html data-theme="dark">`, or create your own with a few CSS variables.
- **Accessible.** Built on native `<dialog>`, `<input>` and `<button>`.
- **Small.** Classes are Tailwind utilities, so only what you use ends up in your CSS.

## Components

Alert, Avatar, Badge, Button, Card, Checkbox, Toggle, Dropdown, Input, Textarea, Select, Field, Modal, Progress, Radial Progress, Spinner, Tabs, Toast, Tooltip. More coming.

Plus a futuristic `hud` theme, HUD effects (`hud-frame`, `hud-scan`, `hud-grid`, `text-glow`) and GSAP style CSS animations (`animate-fade-up`, `stagger`, `reveal`).

## Documentation

Full docs with live examples: https://hammadahmadriaz.github.io/orbit-ui/

## License

MIT
