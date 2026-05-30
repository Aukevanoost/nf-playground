import { ensureStyles } from './ensure-styles';

// Universal CSS contract shared by the host shell and every micro-frontend
// (React and Angular alike). Mirrors the Angular workspace's host styles.scss
// so the `--outer-space` variable, base resets, and typography are guaranteed
// to be present regardless of which framework's MFE renders first.
export const globalContract = `
* { box-sizing: border-box; }

html {
  font-family: Raleway, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 16px;
}

body {
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

p { line-height: 1.5; }

:root {
  --outer-space: 1.5rem;
}
`;

export const GLOBAL_CONTRACT_ID = 'tractor-global';

export function ensureGlobalContract(): void {
  ensureStyles(GLOBAL_CONTRACT_ID, globalContract);
}
