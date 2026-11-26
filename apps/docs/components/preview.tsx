'use client';

import * as React from 'react';

const themes = ['auto', 'light', 'dark', 'hud', 'corporate', 'forest'] as const;
type Theme = (typeof themes)[number];

const modes = ['auto', 'standard', 'enhanced', 'holo'] as const;
type Mode = (typeof modes)[number];

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

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <span className="mr-1 hidden text-[11px] uppercase tracking-wide text-fd-muted-foreground sm:inline">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={
            'rounded-md px-2 py-0.5 text-xs capitalize transition-colors ' +
            (value === o
              ? 'bg-fd-background font-medium text-fd-foreground shadow-sm'
              : 'text-fd-muted-foreground hover:text-fd-foreground')
          }
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export interface PreviewProps {
  children: React.ReactNode;
  /** Layout of the preview area. */
  align?: 'center' | 'start' | 'stack';
  /** Initial interaction mode. */
  mode?: Mode;
  /** Initial theme. */
  theme?: Theme;
  className?: string;
}

/** Renders Orbit UI examples on a themed surface with theme and mode pickers. */
export function Preview({ children, align = 'center', mode: initialMode = 'auto', theme: initialTheme = 'auto', className }: PreviewProps) {
  const site = useSiteTheme();
  const [theme, setTheme] = React.useState<Theme>(initialTheme);
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const resolved = theme === 'auto' ? site : theme;

  const layout =
    align === 'stack'
      ? 'flex flex-col items-stretch gap-4 max-w-md mx-auto w-full'
      : align === 'start'
        ? 'flex flex-wrap items-start gap-3'
        : 'flex flex-wrap items-center justify-center gap-3';

  return (
    <div className="not-prose my-4 rounded-xl border border-fd-border">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-t-xl border-b border-fd-border bg-fd-muted/40 px-2 py-1.5">
        <Segmented label="Mode" options={modes} value={mode} onChange={setMode} />
        <Segmented label="Theme" options={themes} value={theme} onChange={setTheme} />
      </div>
      <div
        data-theme={resolved}
        data-orbit-mode={mode === 'auto' ? undefined : mode}
        className="rounded-b-xl bg-base-100 text-base-content px-6 py-10"
      >
        <div className={`${layout} ${className ?? ''}`}>{children}</div>
      </div>
    </div>
  );
}

/** Shows the same content in standard, enhanced and holo mode side by side. */
export function ModeCompare({ children, theme = 'hud' }: { children: React.ReactNode; theme?: Exclude<Theme, 'auto'> }) {
  const labels: Record<Exclude<Mode, 'auto'>, string> = {
    standard: 'Clean, minimal transitions',
    enhanced: 'Depth and refined motion',
    holo: 'Futuristic HUD behaviour',
  };
  return (
    <div className="not-prose my-4 grid gap-3 md:grid-cols-3">
      {(['standard', 'enhanced', 'holo'] as const).map((m) => (
        <div key={m} className="overflow-visible rounded-xl border border-fd-border">
          <div className="rounded-t-xl border-b border-fd-border bg-fd-muted/40 px-3 py-1.5">
            <span className="block font-mono text-xs font-semibold">{m}</span>
            <span className="block truncate text-xs text-fd-muted-foreground">{labels[m]}</span>
          </div>
          <div
            data-theme={theme}
            data-orbit-mode={m}
            className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-b-xl bg-base-100 p-5 text-base-content"
          >
            {children}
          </div>
        </div>
      ))}
    </div>
  );
}
