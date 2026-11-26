import * as React from "react";

/** useLayoutEffect in the browser, useEffect on the server (no SSR warning). */
export const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** Longest running animation on an element, in ms (duration + delay). 0 when none. */
export function animationMs(el: Element): number {
  const style = getComputedStyle(el);
  const parse = (list: string) =>
    list.split(",").map((v) => {
      const n = parseFloat(v);
      if (Number.isNaN(n)) return 0;
      return v.trim().endsWith("ms") ? n : n * 1000;
    });
  const durations = parse(style.animationDuration || "0s");
  const delays = parse(style.animationDelay || "0s");
  const names = (style.animationName || "none").split(",");
  let max = 0;
  durations.forEach((d, i) => {
    if ((names[i] ?? names[0]).trim() === "none") return;
    max = Math.max(max, d + (delays[i] ?? delays[0] ?? 0));
  });
  return max;
}

/**
 * Keeps an element mounted while its exit animation runs.
 * `state` is "open" or "closed"; render it as data-state so CSS can pick the
 * exit animation. Unmounts after the animation (instantly when there is none,
 * e.g. in standard mode or with reduced motion).
 */
export function usePresence(open: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = React.useState(open);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!closing) return;
    const el = ref.current;
    const ms = el ? animationMs(el) : 0;
    const done = () => {
      setMounted(false);
      setClosing(false);
    };
    if (ms <= 0) {
      done();
      return;
    }
    const timer = setTimeout(done, ms);
    return () => clearTimeout(timer);
  }, [closing, ref]);

  return { mounted: mounted || open, state: (open ? "open" : "closed") as "open" | "closed" };
}

/* Scroll lock with a counter, so nested modals work. */
let locks = 0;
let saved: { overflow: string; paddingRight: string } | null = null;

export function lockScroll() {
  if (typeof document === "undefined") return;
  if (locks++ > 0) return;
  const root = document.documentElement;
  const body = document.body;
  // Keep the page from jumping when the scrollbar disappears.
  const scrollbar = window.innerWidth - root.clientWidth;
  saved = { overflow: root.style.overflow, paddingRight: body.style.paddingRight };
  root.style.overflow = "hidden";
  if (scrollbar > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + scrollbar}px`;
  }
}

export function unlockScroll() {
  if (typeof document === "undefined" || locks === 0) return;
  if (--locks > 0) return;
  document.documentElement.style.overflow = saved?.overflow ?? "";
  document.body.style.paddingRight = saved?.paddingRight ?? "";
  saved = null;
}
