'use client';

import * as React from 'react';

const themes = ['auto', 'light', 'dark', 'corporate', 'forest'] as const;
type Theme = (typeof themes)[number];

/** Follows the docs light/dark toggle (the `dark` class on <html>). */
function useSiteTheme() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const html = document.documentElement;
    const update = () => setDark(html.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark ? 'dark' : 'light';
}

export interface PreviewProps {
  children: React.ReactNode;
  /** Layout of the preview area. */
  align?: 'center' | 'start' | 'stack';
  className?: string;
}

/** Renders Orbit UI examples on a themed surface with a theme picker. */
export function Preview({ children, align = 'center', className }: PreviewProps) {
  const site = useSiteTheme();
  const [theme, setTheme] = React.useState<Theme>('auto');
  const resolved = theme === 'auto' ? site : theme;

  const layout =
    align === 'stack'
      ? 'flex flex-col items-stretch gap-4 max-w-md mx-auto w-full'
      : align === 'start'
        ? 'flex flex-wrap items-start gap-3'
        : 'flex flex-wrap items-center justify-center gap-3';

  return (
    <div className="not-prose my-4 overflow-hidden rounded-xl border border-fd-border">
      <div className="flex items-center justify-end gap-1 border-b border-fd-border bg-fd-muted/40 px-2 py-1.5">
        {themes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={
              'rounded-md px-2 py-0.5 text-xs capitalize transition-colors ' +
              (theme === t ? 'bg-fd-background font-medium text-fd-foreground shadow-sm' : 'text-fd-muted-foreground hover:text-fd-foreground')
            }
          >
            {t}
          </button>
        ))}
      </div>
      <div data-theme={resolved} className="bg-base-100 text-base-content px-6 py-10">
        <div className={`${layout} ${className ?? ''}`}>{children}</div>
      </div>
    </div>
  );
}
