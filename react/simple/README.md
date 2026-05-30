# native-federation-examples-react

A **React 18** todo app packaged as a **native-federation micro frontend**, bundled with **ESbuild** and exposed as a custom element.

## Stack

- **React 18** — hooks, Strict Mode
- **TypeScript** — for type safety
- **ESbuild** — fast dev + production bundling
- **@softarc/native-federation** — module federation runtime
- **Shadow DOM** — styles are encapsulated so the MFE can't leak into the host page

## Getting started

```bash
npm install
```

### Development

```bash
npm start
```

Starts a dev server at <http://localhost:3000> with file watching.

### Production build

```bash
npm run build
```

Outputs federation artifacts and minified bundles to `dist/`.

### Preview the production build

```bash
npm run preview
```

## How it works

The app exposes itself as a federation remote named `@team/mfe1` (see `federation.config.js`). The host page in `public/index.html` declares an `mfe-manifest`, loads the orchestrator runtime, and mounts the remote as a custom element:

```html
<my-react-app></my-react-app>
```

`src/app.tsx` defines that custom element, attaches a Shadow DOM, injects the scoped styles, and renders `<TodoApp />` into it.

## Project structure

```
├── public/
│   └── index.html            # Host page + federation manifest
├── src/
│   ├── app.tsx               # Custom-element shell (Shadow DOM + mount)
│   ├── TodoApp.tsx           # Root component — owns todo state
│   ├── types.ts              # Todo, Filter
│   ├── styles.ts             # Shadow-scoped CSS
│   └── components/
│       ├── Header.tsx        # Title + remaining count
│       ├── Compose.tsx       # Input + Add button
│       ├── Filters.tsx       # All / Active / Completed
│       ├── TodoList.tsx      # List + empty state
│       ├── TodoItem.tsx      # Single todo row
│       └── Footer.tsx        # Total + Clear completed
├── federation.config.js      # Native-federation exposes + shared deps
├── build.mjs                 # ESbuild dev/build script
├── tsconfig.json
└── package.json
```

## Features

- Add todos (Enter or the Add button)
- Toggle complete, delete on hover
- Filter by All / Active / Completed
- Clear all completed at once
- Live remaining count
