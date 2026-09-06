# Initial App Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Flashcard App as an npm workspace with a working `npm run dev`, a minimal client and server connected through the Vite proxy, and a full test pipeline (unit, API, e2e) enforced by a pre-commit hook.

**Architecture:** Two npm workspace packages (`client`, `server`) plus a root-level `e2e` directory. The server is a minimal Express app exposing `GET /api/ping`; the client is a minimal React app whose Vite dev server proxies `/api` to the server. Playwright drives both dev servers together to prove the proxy wiring end-to-end. A Husky pre-commit hook (added last, once every script it calls actually works) runs lint, unit/API tests, and e2e tests on every commit.

**Tech Stack:** React, Vite, Express (Node ESM), Zod (not yet used — no validated routes exist yet), Vitest, Supertest, Testing Library, Playwright, ESLint, Prettier, Husky, lint-staged.

**Spec:** `docs/superpowers/specs/2026-09-06-initial-scaffold-design.md`

## Global Constraints

These apply to every task below, per CLAUDE.md and the spec's Constraints section:

- Test-first development (TDD). Tests come first, always.
- Build production-grade code.
- Use React and Express readability best practices.
- Validate frontend inputs, including required fields, types, length limits, and basic formats. (No user-facing inputs exist yet in this scaffold — applies to future feature work.)
- Write for a junior-to-mid-level developer. Prefer clear and conventional code over clever code.
- Use pragmatic error handling.
- Write end-to-end tests for critical application paths.
- Add short why-comments when they help a beginner.
- Don't recommend approaches until asked.
- Validation: Zod at the API route boundary when added. (Not yet — `GET /api/ping` takes no input.)
- ORM: Sequelize with SQLite, models in `server/src/db.js`, `server/flashcards.db` in production / `:memory:` in tests via `NODE_ENV=test`. (Not needed until the first feature requiring persistence.)
- Tests: Vitest and Supertest. `beforeAll` calls `sequelize.sync({ force: true })` and `seed()` once the database exists. (No database in this scaffold.)
- E2E: Playwright in `/e2e`.
- Errors: Return `{ error: { code, message } }`; use 404 for unknown routes and resources. (No error paths exist yet — `GET /api/ping` has no failure mode.)
- Pre-commit: Run lint, unit, API, and E2E tests. Never bypass it with `--no-verify`.

---

## File Structure

```
Flashcard App/
├── package.json           # root workspace: scripts, lint-staged config
├── .gitignore
├── .eslintrc.json          # shared ESLint config (no extra plugins — see note above)
├── .husky/pre-commit       # runs lint-staged, unit/API tests, e2e tests
├── playwright.config.js    # root-level, testDir: ./e2e, starts both dev servers
├── client/
│   ├── package.json
│   ├── index.html          # Vite entry point
│   ├── vite.config.js      # dev proxy /api -> :3001, Vitest config
│   └── src/
│       ├── main.jsx        # mounts <App />
│       ├── App.jsx         # minimal placeholder component
│       ├── App.test.jsx    # TDD: written before App.jsx
│       └── test-setup.js   # imports @testing-library/jest-dom
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js          # builds/exports Express app, GET /api/ping
│       ├── app.test.js     # TDD: written before the route
│       └── index.js        # imports app, calls app.listen(3001)
└── e2e/
    └── ping.spec.js        # loads client, checks proxied GET /api/ping
```

**Responsibilities:**
- Root `package.json` owns cross-workspace orchestration (`dev`, `lint`, `test`, `test:e2e`) — it never contains business logic.
- `server/src/app.js` is separate from `server/src/index.js` specifically so Supertest can import the app without binding a port.
- `client/src/App.jsx` stays a placeholder — no flashcard domain logic belongs in this scaffold.

---

### Task 1: Root workspace, ESLint, and .gitignore

**Files:**
- Create: `package.json`
- Create: `client/package.json`
- Create: `server/package.json`
- Create: `.gitignore`
- Create: `.eslintrc.json`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: root `npm run dev|lint|test|test:e2e` script names that every later task's scripts plug into; `client` and `server` as valid npm workspaces; a shared `.eslintrc.json` at the repo root that all later JS/JSX files are linted against.

- [ ] **Step 1: Write the root `package.json`**

```json
{
  "name": "flashcard-app",
  "private": true,
  "type": "module",
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "lint": "eslint .",
    "test": "npm run test -w server && npm run test -w client",
    "test:e2e": "playwright test",
    "prepare": "husky"
  },
  "lint-staged": {
    "**/*.{js,jsx}": "eslint"
  }
}
```

- [ ] **Step 2: Write workspace stub manifests**

`client/package.json`:

```json
{
  "name": "client",
  "private": true,
  "type": "module"
}
```

`server/package.json`:

```json
{
  "name": "server",
  "private": true,
  "type": "module"
}
```

These stubs exist so `npm install` below can resolve the workspaces. Tasks 2 and 3 fill in real scripts and dependencies.

- [ ] **Step 3: Install root devDependencies**

Run:

```bash
npm install -D concurrently eslint prettier husky lint-staged @playwright/test
```

Expected: completes without error, creates `package-lock.json` and `node_modules/`, adds all five packages to root `package.json` under `devDependencies`, and (because `prepare` runs after install) creates a `.husky/` directory via Husky's setup — no `pre-commit` file yet, that's added in Task 5.

- [ ] **Step 4: Write `.gitignore`**

```
node_modules/
client/dist/
server/flashcards.db
playwright-report/
test-results/
.DS_Store
```

- [ ] **Step 5: Write `.eslintrc.json`**

```json
{
  "root": true,
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  },
  "globals": {
    "describe": "readonly",
    "it": "readonly",
    "expect": "readonly",
    "beforeAll": "readonly",
    "beforeEach": "readonly",
    "afterAll": "readonly",
    "afterEach": "readonly",
    "vi": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": ["eslint:recommended"],
  "ignorePatterns": ["node_modules", "client/dist", "playwright-report", "test-results"]
}
```

The `globals` block exists because Task 3's client tests run with Vitest's `globals: true` (needed for `@testing-library/jest-dom`'s side-effect import to find a global `expect`), so `describe`/`it`/`expect`/etc. are used without importing them. Server tests (Task 2) import them explicitly from `vitest` instead — both styles lint cleanly against this config.

- [ ] **Step 6: Verify the ESLint config loads**

Run:

```bash
npx eslint --print-config package.json
```

Expected: prints the resolved config as JSON, no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json client/package.json server/package.json .gitignore .eslintrc.json .husky
git commit -m "chore: scaffold root workspace, ESLint config, and gitignore"
```

---

### Task 2: Server scaffold with TDD ping route

**Files:**
- Modify: `server/package.json`
- Create: `server/src/app.js`
- Create: `server/src/app.test.js`
- Create: `server/src/index.js`

**Interfaces:**
- Consumes: `server` workspace registered in root `package.json` (Task 1)
- Produces: `server/src/app.js` exporting a default Express `app` instance with `GET /api/ping` registered — this is what `server/src/index.js` (this task) and Playwright's `webServer` (Task 4, via `npm run dev -w server`) rely on.

- [ ] **Step 1: Install server dependencies**

```bash
npm install express zod -w server
npm install -D vitest supertest -w server
```

- [ ] **Step 2: Add scripts to `server/package.json`**

Edit `server/package.json` to add a `"scripts"` key (alongside the `name`/`private`/`type` fields already there and the `dependencies`/`devDependencies` npm just added):

```json
"scripts": {
  "dev": "node --watch src/index.js",
  "test": "vitest run"
},
```

- [ ] **Step 3: Write the failing test**

`server/src/app.test.js`:

```js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('GET /api/ping', () => {
  it('responds with a pong message', async () => {
    const response = await request(app).get('/api/ping');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'pong' });
  });
});
```

- [ ] **Step 4: Run the test and confirm it fails**

```bash
npm run test -w server
```

Expected: FAIL — `app.js` does not exist yet, so the import errors (e.g. "Cannot find module").

- [ ] **Step 5: Implement the minimal app**

`server/src/app.js`:

```js
import express from 'express';

const app = express();

// GET /api/ping is a health check the client (and Playwright) can call
// to confirm the server is reachable through the proxy.
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

export default app;
```

- [ ] **Step 6: Run the test and confirm it passes**

```bash
npm run test -w server
```

Expected: PASS.

- [ ] **Step 7: Write the entry point**

`server/src/index.js`:

```js
import app from './app.js';

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

- [ ] **Step 8: Manually verify the dev server**

```bash
npm run dev -w server &
SERVER_PID=$!
sleep 1
curl -s http://localhost:3001/api/ping
kill $SERVER_PID
```

Expected output: `{"message":"pong"}`

- [ ] **Step 9: Commit**

```bash
git add server/package.json server/src/app.js server/src/app.test.js server/src/index.js
git commit -m "feat(server): add GET /api/ping"
```

---

### Task 3: Client scaffold with TDD App component

**Files:**
- Modify: `client/package.json`
- Create: `client/index.html`
- Create: `client/vite.config.js`
- Create: `client/src/test-setup.js`
- Create: `client/src/App.test.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/main.jsx`

**Interfaces:**
- Consumes: `client` workspace registered in root `package.json` (Task 1)
- Produces: `client/src/App.jsx` exporting a default React component that renders a heading matching `/flashcard app/i` — Task 4's Playwright smoke test asserts on this same heading, so the text must stay in sync between the two.

- [ ] **Step 1: Install client dependencies**

```bash
npm install react react-dom prop-types -w client
npm install -D vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom -w client
```

- [ ] **Step 2: Add scripts to `client/package.json`**

Edit `client/package.json` to add:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest run"
},
```

- [ ] **Step 3: Write `client/vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
});
```

`globals: true` is required here (not optional) — `@testing-library/jest-dom`'s side-effect import in Step 4 extends the global `expect`, which only exists when Vitest's globals are enabled.

- [ ] **Step 4: Write `client/src/test-setup.js`**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Write `client/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flashcard App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write the failing test**

`client/src/App.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the app heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /flashcard app/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run the test and confirm it fails**

```bash
npm run test -w client
```

Expected: FAIL — `App.jsx` does not exist yet.

- [ ] **Step 8: Implement the minimal component**

`client/src/App.jsx`:

```jsx
function App() {
  return (
    <div>
      <h1>Flashcard App</h1>
    </div>
  );
}

export default App;
```

- [ ] **Step 9: Run the test and confirm it passes**

```bash
npm run test -w client
```

Expected: PASS.

- [ ] **Step 10: Write the entry point**

`client/src/main.jsx`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 11: Verify the production build works**

```bash
npm run build -w client
```

Expected: completes without error, writes output to `client/dist/`.

- [ ] **Step 12: Commit**

```bash
git add client/package.json client/index.html client/vite.config.js client/src
git commit -m "feat(client): add minimal App component"
```

---

### Task 4: Playwright e2e config and proxy smoke test

**Files:**
- Create: `playwright.config.js`
- Create: `e2e/ping.spec.js`

**Interfaces:**
- Consumes: `npm run dev -w server` (Task 2) and `npm run dev -w client` (Task 3) as the commands Playwright's `webServer` config starts; the `/flashcard app/i` heading text from `client/src/App.jsx` (Task 3); the `{ message: "pong" }` response shape from `server/src/app.js` (Task 2)
- Produces: `npm run test:e2e` as a working root script — Task 5's pre-commit hook calls this directly.

- [ ] **Step 1: Install the Playwright browser binary**

```bash
npx playwright install chromium
```

- [ ] **Step 2: Write `playwright.config.js`**

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: [
    {
      command: 'npm run dev -w server',
      port: 3001,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev -w client',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

- [ ] **Step 3: Write `e2e/ping.spec.js`**

```js
import { test, expect } from '@playwright/test';

test('loads the app and proxies GET /api/ping to the server', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /flashcard app/i })).toBeVisible();

  // Requested against baseURL (the Vite dev server), not directly against
  // port 3001 — this is what actually proves the proxy wiring works.
  const response = await request.get('/api/ping');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ message: 'pong' });
});
```

- [ ] **Step 4: Run the e2e suite and confirm it passes**

```bash
npm run test:e2e
```

Expected: PASS — Playwright starts both dev servers, runs the test, tears them down.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.js e2e/ping.spec.js
git commit -m "test(e2e): add Playwright smoke test for the proxied ping route"
```

---

### Task 5: Husky pre-commit hook

**Files:**
- Create: `.husky/pre-commit`

**Interfaces:**
- Consumes: `npx lint-staged` (Task 1 config), `npm run test` (Tasks 2+3), `npm run test:e2e` (Task 4) — all three must already work, which is why this task runs last.
- Produces: nothing further downstream — this is the last task in the plan.

- [ ] **Step 1: Confirm Husky is initialized**

```bash
ls .husky
```

Expected: the directory exists (created by Task 1's `prepare` script). If it doesn't, run `npx husky` to create it.

- [ ] **Step 2: Write `.husky/pre-commit`**

```sh
npx lint-staged
npm run test
npm run test:e2e
```

- [ ] **Step 3: Make the hook executable**

```bash
chmod +x .husky/pre-commit
```

- [ ] **Step 4: Verify the hook runs on commit**

```bash
git add .husky/pre-commit
git commit -m "chore: run lint, unit/API, and e2e tests on pre-commit"
```

Expected: the commit output shows `lint-staged` running, then the unit/API test suite, then the Playwright suite, all passing, before the commit is created. Per CLAUDE.md, this hook must never be bypassed with `--no-verify` — if any step fails, fix the underlying issue rather than skipping the hook.
