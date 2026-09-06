// Flat config, required by the installed ESLint v10 (no eslintrc support).
// Uses only ESLint's built-in core rules so no extra lint plugins are needed.
export default [
  {
    ignores: ['node_modules/**', 'client/dist/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        fetch: 'readonly',
        // Vitest runs with `globals: true` in the client, so these test
        // identifiers are used without an import there.
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
