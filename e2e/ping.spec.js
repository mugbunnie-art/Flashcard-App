import { test, expect } from '@playwright/test';

test('loads the app and proxies GET /api/ping to the server', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /mugbunnie study/i })).toBeVisible();

  // Requested against baseURL (the Vite dev server), not directly against
  // port 3001 — this is what actually proves the proxy wiring works.
  const response = await request.get('/api/ping');
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ message: 'pong' });
});
