import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import type { MDXComponents } from 'mdx/types';
import * as UI from '@orbitdesign/ui/react';
import { Preview } from './preview';
import * as Demos from './demos';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Orbit UI exports its own Card, so the Fumadocs one is renamed.
    DocsCard: defaultMdxComponents.Card,
    Tab,
    Tabs,
    Step,
    Steps,
    TypeTable,
    Preview,
    ...Demos,
    ...UI,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
