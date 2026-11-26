import { RootProvider } from 'fumadocs-ui/provider/next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import type { Metadata } from 'next';
import { basePath } from '@/lib/shared';
import './global.css';

export const metadata: Metadata = {
  title: {
    default: 'Orbit UI: Tailwind CSS components with themes',
    template: '%s | Orbit UI',
  },
  description:
    'A Tailwind CSS v4 component library. Semantic classes for any framework, typed React components and built-in themes.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <RootProvider search={{ options: { type: 'static', api: `${basePath}/api/search` } }}>{children}</RootProvider>
      </body>
    </html>
  );
}
