import { test, expect } from '@playwright/test';

test('login flow works', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'test@local');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  // expect either redirect or presence of dashboard element
  await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 });
});