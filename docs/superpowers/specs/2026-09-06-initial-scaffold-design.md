# Initial App Scaffold — Design

## Purpose

Scaffold the Flashcard App as an npm workspace with a Vite + React
client, an Express (Node ESM) server, and a Playwright e2e suite, so
that future feature work has a working `npm run dev`, a passing test
setup, and a pre-commit hook in place from the start.

## Scope

This is a from-scratch scaffold — there is no existing app code to
extend. It covers:

- Root workspace configuration and tooling (lint, format, git hooks)
- A minimal Vite + React client that proxies `/api/*` to the server
- A minimal Express server exposing `GET /api/ping`
- A Playwright e2e project skeleton
- Test setup (Vitest + Testing Library on the client, Vitest +
  Supertest on the server) wired so TDD can be followed from the
  first real feature

It does not cover any flashcard domain logic (decks, cards, review
scheduling, etc.) — that is future work, out of scope here.

## Architecture

```
Flashcard App/
├── package.json           # root workspace config
├── .gitignore
├── .eslintrc.json          # or eslint.config.js, see below
├── .husky/                 # pre-commit hook
├── playwright.config.js    # Playwright config, at project root
├── client/                 # Vite + React frontend
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.test.jsx
│       └── test-setup.js
├── server/                 # Express API (Node ESM)
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── app.test.js
│       └── index.js
└── e2e/                    # Playwright tests
    └── ping.spec.js
```

Two workspace packages (`client`, `server`) plus a root-level `e2e`
directory that is not its own workspace package. `playwright.config.js`
lives at the project root (not inside `e2e/`) and points its `testDir`
at `./e2e`, so Playwright runs from the root against both dev servers.

## Root workspace (`package.json`)

- `"workspaces": ["client", "server"]`
- `"scripts"`, all required so the pre-commit hook and CLAUDE.md's
  commands work as documented:
  - `"dev"`: `concurrently "npm run dev -w server" "npm run dev -w client"`
  - `"lint"`: `eslint .`
  - `"test"`: `npm run test -w server && npm run test -w client`
    (runs the server's unit/API tests and the client's unit tests;
    each workspace's own `test` script runs Vitest once, non-watch,
    e.g. `vitest run`)
  - `"test:e2e"`: `playwright test`
  - `"prepare"`: `husky` (registers the git hooks on `npm install`)
- devDependencies: `concurrently`, `eslint`, `prettier`, `husky`,
  `lint-staged`, `@playwright/test`
- `lint-staged` config (in `package.json` or `.lintstagedrc`):
  `{"**/*.{js,jsx}": "eslint"}`
- `.husky/pre-commit` runs, in order: `npx lint-staged`, `npm run
  test`, `npm run test:e2e`. Per CLAUDE.md, this hook is never
  bypassed with `--no-verify`.
- `.eslintrc.json` (or flat-config `eslint.config.js`) at the root,
  shared by `client` and `server`: base `eslint:recommended`, plus
  `eslint-plugin-react` and the React Hooks rules for `client/**`
  (jsx-aware parsing so `.jsx` files lint cleanly), and Node/ESM globals
  for `server/**`. This is what `npm run lint` and `lint-staged`
  actually run against — without it those scripts have no rules to
  enforce.
- `.gitignore` at the root covering `node_modules/`, build output
  (`client/dist/`), the dev SQLite file (`server/flashcards.db`),
  Playwright artifacts (`playwright-report/`, `test-results/`), and
  editor/OS cruft (`.DS_Store`).

## `client/` — Vite + React frontend

- `client/package.json`: its own workspace manifest — `name`,
  `"type": "module"`, dependencies, devDependencies (below), and
  scripts `"dev": "vite"`, `"build": "vite build"`,
  `"test": "vitest run"`
- dependencies: `react`, `react-dom`, `prop-types`
- devDependencies: `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`
- `index.html`: the Vite entry HTML at `client/index.html` — root
  `<div id="root"></div>` plus `<script type="module" src="/src/main.jsx">`.
  Required for `vite` and `vite build` to have an entry point at all.
- `vite.config.js`:
  - dev server proxy: `/api` → `http://localhost:3001`
  - Vitest config: `environment: 'jsdom'`,
    `setupFiles: ['./src/test-setup.js']`
- `src/test-setup.js`: imports `@testing-library/jest-dom`
- `src/main.jsx`: mounts `<App />` into `#root`
- `src/App.jsx`: minimal placeholder component (e.g. renders an `h1`
  with the app name)
- `src/App.test.jsx`: written first (TDD) — asserts `App` renders
  expected content, before `App.jsx` is implemented

## `server/` — Express backend (Node ESM), port 3001

- `server/package.json`: its own workspace manifest — `name`,
  `"type": "module"`, dependencies, devDependencies (below), and
  scripts `"dev": "node --watch src/index.js"`,
  `"test": "vitest run"`
- dependencies: `express`, `zod`
- devDependencies: `vitest`, `supertest`
- `src/app.js`: builds the Express app, registers routes, exports the
  app (no `listen()` call here, so it can be imported directly by
  Supertest)
- `src/index.js`: imports the app from `app.js`, calls
  `app.listen(3001)`
- `src/app.test.js`: written first (TDD) — Supertest test asserting
  `GET /api/ping` returns `{ message: "pong" }`, before the route is
  implemented in `app.js`

## `e2e/` — Playwright

- `playwright.config.js` at the project root (see the Architecture
  tree above), with `testDir: './e2e'`, configured to start the dev
  servers (or expect them running) and test against
  `http://localhost:5173`
- `e2e/ping.spec.js`: a smoke test with two assertions, both required
  so the test validates the full stack rather than just the client:
  1. Loads the client at `/` and confirms the page renders (e.g. the
     `App` placeholder content is visible).
  2. Sends a `GET` request to `/api/ping` **through the Vite dev
     server proxy** (i.e. requested against the `http://localhost:5173`
     base URL, not directly against port 3001) and asserts the JSON
     body equals `{ message: "pong" }`. This is what actually proves
     the client-to-server proxy wiring works end-to-end, not just that
     each half runs in isolation.

## Testing approach (TDD)

Per CLAUDE.md, tests come first. This scaffold has very little
business logic, so TDD applies narrowly:

- **Server**: `app.test.js` (Supertest test for `GET /api/ping`) is
  written and run (failing) before `GET /api/ping` is implemented in
  `app.js`.
- **Client**: `App.test.jsx` (render assertion) is written and run
  (failing) before `App.jsx` is implemented.
- Config and wiring files (root `package.json`, `vite.config.js`,
  `playwright.config.js`, husky/lint-staged setup, `.eslintrc.json`)
  are not "test-first" in the same sense — they are verified by
  running the commands they configure (`npm run dev`, `npm run lint`,
  `npm test`, `npm run test:e2e`) after being written.

## Error handling

Out of scope for this scaffold beyond the CLAUDE.md convention
already on record (`{ error: { code, message } }`, 404 for unknown
routes/resources) — there are no error paths to implement yet since
`GET /api/ping` has no failure mode. Future routes will follow that
convention.

## Constraints

These carry forward into the implementation plan verbatim, per
CLAUDE.md's instruction that plan output must restate them:

### Coding guidelines

- Test-first development (TDD). Tests come first, always.
- Build production-grade code.
- Use React and Express readability best practices.
- Validate frontend inputs, including required fields, types, length
  limits, and basic formats.
- Write for a junior-to-mid-level developer. Prefer clear and
  conventional code over clever code.
- Use pragmatic error handling.
- Write end-to-end tests for critical application paths.
- Add short why-comments when they help a beginner.
- Don't recommend approaches until asked.

### Conventions

- Validation: Zod at the API route boundary when added.
- ORM: Sequelize with SQLite. Models belong in `server/src/db.js`. Use
  `server/flashcards.db` in production and `:memory:` in tests through
  `NODE_ENV=test`. (Not needed yet for this scaffold — no models
  exist until a first domain feature is built.)
- Tests: Vitest and Supertest. Test `beforeAll` calls
  `sequelize.sync({ force: true })` and `seed()` after the database is
  added. (Not applicable yet — no database in this scaffold.)
- E2E: Playwright in `/e2e`.
- Errors: Return `{ error: { code, message } }`; use 404 for unknown
  routes and resources.
- Pre-commit: Run lint, unit, API, and E2E tests. Never bypass it with
  `--no-verify`.

## Out of scope / future work

- Any flashcard domain model (decks, cards, review scheduling)
- Sequelize/SQLite wiring (`server/src/db.js`) — introduced with the
  first feature that needs persistence
- Authentication
