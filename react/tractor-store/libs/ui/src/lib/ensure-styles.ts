/**
 * Idempotent <style> injection — same contract as each remote's local
 * `ensureStyles`. Lives in libs/ui so shared components can inject their
 * own CSS without a bundling pipeline, since the federation runtime serves
 * only JS bundles to consumers.
 */
export function ensureStyles(id: string, css: string): void {
  if (typeof document === 'undefined') return;
  const attr = `data-mfe-style-${id}`;
  if (document.head.querySelector(`style[${attr}]`)) return;
  const el = document.createElement('style');
  el.setAttribute(attr, '');
  el.textContent = css;
  document.head.appendChild(el);
}
