import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Static search index, so the docs can be exported as a static site
// (GitHub Pages). The browser downloads the index and searches locally.
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
