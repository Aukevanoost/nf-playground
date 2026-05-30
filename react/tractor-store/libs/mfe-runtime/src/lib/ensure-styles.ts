// Idempotently appends a <style> element to <head> the first time the given
// id is seen. Used by MFE fragments to inject scoped CSS without relying on
// a CSS bundling pipeline — federation can't ship CSS sidecars for exposed
// entries, so styles travel as JS template literals.
export function ensureStyles(id: string, css: string): void {
  if (typeof document === 'undefined') return;
  const attr = `data-mfe-style-${id}`;
  if (document.head.querySelector(`style[${attr}]`)) return;
  const el = document.createElement('style');
  el.setAttribute(attr, '');
  el.textContent = css;
  document.head.appendChild(el);
}
