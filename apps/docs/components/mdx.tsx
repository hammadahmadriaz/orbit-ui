import type * as React from 'react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import type { MDXComponents } from 'mdx/types';
import * as UI from '@orbitdesign/ui/react';
import { ModeCompare, Preview } from './preview';
import * as Demos from './demos';

// Orbit UI exports Tabs/Tab and Card, which clash with Fumadocs names used in MDX.
// Fumadocs keeps Tabs/Tab (code tabs); Orbit's are OrbitTabs/OrbitTab.
// Orbit keeps Card (previews); Fumadocs' is DocsCard.
// Only components go into MDX (exports that start with a capital letter);
// helpers like cx, useToast and useOrbit are left out.
const { Tabs: OrbitTabs, Tab: OrbitTab, ...exports } = UI;
const OrbitUI = Object.fromEntries(
  Object.entries(exports).filter(([name]) => /^[A-Z]/.test(name)),
) as Record<string, React.ComponentType<any>>;

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    DocsCard: defaultMdxComponents.Card,
    Step,
    Steps,
    TypeTable,
    Preview,
    ModeCompare,
    ...Demos,
    ...OrbitUI,
    OrbitTabs,
    OrbitTab,
    Tab,
    Tabs,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
