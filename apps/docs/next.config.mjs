import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Set by the GitHub Pages workflow, e.g. "/orbit-ui". Empty for Vercel or local dev.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const staticExport = process.env.STATIC_EXPORT === '1';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@orbitdesign/ui'],
  basePath: basePath || undefined,
  ...(staticExport && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default withMDX(config);
