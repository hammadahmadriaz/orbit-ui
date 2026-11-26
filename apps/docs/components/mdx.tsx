import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import type { MDXComponents } from 'mdx/types';
import * as UI from '@orbitdesign/ui/react';
import { Preview } from './preview';
import * as Demos from './demos';

// Orbit UI exports Tabs/Tab and Card, which clash with Fumadocs names used in MDX.
// Fumadocs keeps Tabs/Tab (code tabs); Orbit's are OrbitTabs/OrbitTab.
// Orbit keeps Card (previews); Fumadocs' is DocsCard.
// cx and useToast are helpers, not components.
const { Tabs: OrbitTabs, Tab: OrbitTab, cx: _cx, useToast: _useToast, ...OrbitUI } = UI;

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    DocsCard: defaultMdxComponents.Card,
    Step,
    Steps,
    TypeTable,
    Preview,
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
