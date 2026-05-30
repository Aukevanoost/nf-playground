// Shadow-DOM aware style adoption. Replaces the document.head-based
// `ensureStyles` for components rendered inside an MFE's shadow root.
//
// One `CSSStyleSheet` per id is cached and reused, so N instances of the
// same MFE share a single sheet object (cheap) rather than N copies. A
// per-root applied-set guards against re-adopting the same id when a
// component re-renders.

const cache = new Map<string, CSSStyleSheet>();
const applied = new WeakMap<ShadowRoot, Set<string>>();

export function adoptStyles(root: ShadowRoot, id: string, css: string): void {
  let seen = applied.get(root);
  if (!seen) {
    seen = new Set();
    applied.set(root, seen);
  }
  if (seen.has(id)) return;

  let sheet = cache.get(id);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    cache.set(id, sheet);
  }
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  seen.add(id);
}
