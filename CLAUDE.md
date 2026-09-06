# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Stack

A flashcard app for studying via question/answer decks.
React + Vite frontend, Express backend (Node ESM). Database: SQLite via Sequelize ORM.

## Commands

```sh
npm run dev             # start server and client concurrently
npm run dev -w server   # server only, port 3001
npm run dev -w client   # client only, port 5173
```

## Structure

```text
client/          Vite + React frontend
server/          Express API
  src/app.js     Route handlers
  src/index.js   Entry point
```

## API routes

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | /api/ping | Health check |

The Vite development server proxies `/api/*` to `http://localhost:3001`.

## DO NOT MODIFY THIS SECTION WITHOUT ASKING ME

- Every write-plan output must restate the coding guidelines and conventions in a "Constraints" section—execute-plan subagents read the plan, not this file.

### Coding guidelines

- Test-first development (TDD). Tests come first, always.
- Build production-grade code.
- Use React and Express readability best practices.
- Validate frontend inputs, including required fields, types, length limits, and basic formats.
- Write for a junior-to-mid-level developer. Prefer clear and conventional code over clever code.
- Use pragmatic error handling.
- Write end-to-end tests for critical application paths.
- Add short why-comments when they help a beginner.
- Don't recommend approaches until I ask for them.

### Conventions

- Validation: Zod at the API route boundary when added.
- ORM: Sequelize with SQLite. Models belong in `server/src/db.js`. Use `server/flashcards.db` in production and `:memory:` in tests through `NODE_ENV=test`.
- Tests: Vitest and Supertest. Test `beforeAll` calls `sequelize.sync({ force: true })` and `seed()` after the database is added.
- E2E: Playwright in `/e2e`.
- Errors: Return `{ error: { code, message } }`; use 404 for unknown routes and resources.
- Pre-commit: Run lint, unit, API, and E2E tests. Never bypass it with `--no-verify`.
