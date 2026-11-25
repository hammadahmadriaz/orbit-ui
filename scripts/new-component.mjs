#!/usr/bin/env node
/**
 * Scaffold a new component.
 *
 *   pnpm new:component tooltip
 *   pnpm new:component progress-bar
 *
 * Creates the CSS, React component, test and docs page, and registers
 * the component in both index files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = process.argv[2];

if (!raw || !/^[a-z][a-z0-9-]*$/.test(raw)) {
  console.error("Usage: pnpm new:component <name>   (lowercase, dashes allowed, e.g. progress-bar)");
  process.exit(1);
}

const name = raw; // kebab-case, used for files and the CSS class
const Pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const Title = name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

const files = {
  css: path.join(root, "packages/ui/src/css/components", `${name}.css`),
  react: path.join(root, "packages/ui/src/react/components", `${name}.tsx`),
  test: path.join(root, "packages/ui/test", `${name}.test.tsx`),
  docs: path.join(root, "apps/docs/content/docs/components", `${name}.mdx`),
};

for (const file of Object.values(files)) {
  if (fs.existsSync(file)) {
    console.error(`Already exists: ${path.relative(root, file)}`);
    process.exit(1);
  }
}

const css = `/*
 * ${Title}
 * Classes: ${name}
 * Colors:  ${name}-primary ... (add as needed)
 * Sizes:   ${name}-sm ${name}-md ${name}-lg
 *
 * Pattern: the base class READS variables with fallbacks,
 * modifiers only SET them. See button.css for a full example.
 */

@utility ${name} {
  display: flex;
  padding: var(--${name}-p, 1rem);
  border: var(--oui-border) solid var(--color-base-300);
  border-radius: var(--radius-box);
  background-color: var(--${name}-bg, var(--color-base-100));
  color: var(--${name}-fg, var(--color-base-content));
}

@utility ${name}-primary {
  --${name}-bg: var(--color-primary);
  --${name}-fg: var(--color-primary-content);
}

@utility ${name}-sm {
  --${name}-p: 0.5rem;
}
@utility ${name}-md {
  --${name}-p: 1rem;
}
@utility ${name}-lg {
  --${name}-p: 1.5rem;
}
`;

const react = `import * as React from "react";
import { cx } from "../utils";

/* Full class strings (no template literals) so Tailwind can detect them. */
const colors = {
  primary: "${name}-primary",
} as const;

const sizes = {
  sm: "${name}-sm",
  md: "${name}-md",
  lg: "${name}-lg",
} as const;

export interface ${Pascal}Props extends React.HTMLAttributes<HTMLDivElement> {
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
}

export const ${Pascal} = React.forwardRef<HTMLDivElement, ${Pascal}Props>(function ${Pascal}(
  { color, size, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("${name}", color && colors[color], size && sizes[size], className)}
      {...props}
    />
  );
});
`;

const test = `import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ${Pascal} } from "../src/react";

describe("${Pascal}", () => {
  it("renders with base and modifier classes", () => {
    render(<${Pascal} color="primary" size="lg">Hello</${Pascal}>);
    expect(screen.getByText("Hello")).toHaveClass("${name}", "${name}-primary", "${name}-lg");
  });

  it("merges className", () => {
    render(<${Pascal} className="mt-4">Hi</${Pascal}>);
    expect(screen.getByText("Hi")).toHaveClass("${name}", "mt-4");
  });
});
`;

const docs = `---
title: ${Title}
description: TODO one sentence about what ${Title} is for.
---

<Preview>
  <${Pascal}>Default</${Pascal}>
  <${Pascal} color="primary">Primary</${Pascal}>
</Preview>

<Tabs items={["React", "HTML"]}>
<Tab value="React">

\`\`\`tsx
import { ${Pascal} } from "orbitui/react";

<${Pascal}>Default</${Pascal}>
<${Pascal} color="primary">Primary</${Pascal}>
\`\`\`

</Tab>
<Tab value="HTML">

\`\`\`html
<div class="${name}">Default</div>
<div class="${name} ${name}-primary">Primary</div>
\`\`\`

</Tab>
</Tabs>

## Sizes

<Preview>
  <${Pascal} size="sm">Small</${Pascal}>
  <${Pascal} size="md">Medium</${Pascal}>
  <${Pascal} size="lg">Large</${Pascal}>
</Preview>

\`\`\`tsx
<${Pascal} size="sm">Small</${Pascal}>
<${Pascal} size="lg">Large</${Pascal}>
\`\`\`

## Props

<TypeTable
  type={{
    color: { type: '"primary"' },
    size: { type: '"sm" | "md" | "lg"', default: '"md"' },
  }}
/>

## Classes

| Class | Description |
| --- | --- |
| \`${name}\` | Base class |
| \`${name}-primary\` | Color |
| \`${name}-sm\` \`${name}-md\` \`${name}-lg\` | Size |
`;

/** Insert a line between the components:start/end markers and keep the block sorted. */
function register(file, line) {
  const src = fs.readFileSync(file, "utf8");
  const re = /(\/\* components:start[^\n]*\n)([\s\S]*?)(\/\* components:end \*\/)/;
  const m = src.match(re);
  if (!m) throw new Error(`Markers not found in ${file}`);
  const lines = m[2].split("\n").filter(Boolean);
  if (!lines.includes(line)) lines.push(line);
  lines.sort();
  fs.writeFileSync(file, src.replace(re, `$1${lines.join("\n")}\n$3`));
}

fs.writeFileSync(files.css, css);
fs.writeFileSync(files.react, react);
fs.writeFileSync(files.test, test);
fs.writeFileSync(files.docs, docs);

register(path.join(root, "packages/ui/src/css/index.css"), `@import "./components/${name}.css";`);
register(path.join(root, "packages/ui/src/react/index.ts"), `export * from "./components/${name}";`);

console.log(`\nCreated ${Pascal}:\n`);
for (const f of Object.values(files)) console.log("  " + path.relative(root, f));
console.log(`\nRegistered in packages/ui/src/css/index.css and packages/ui/src/react/index.ts`);
console.log(`\nNext steps:
  1. Design the styles in ${path.relative(root, files.css)}
  2. Update props in ${path.relative(root, files.react)}
  3. Run "pnpm dev" and open http://localhost:3000/docs/components/${name}
  4. Run "pnpm changeset" and describe the new component
`);
