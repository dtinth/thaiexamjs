import { test, expect } from '@playwright/test';

test('onet_m6.html page contains required headings', async ({ page }) => {
  // Navigate to the page
  await page.goto('/onet_m6.html');

  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');

  // Check that page loads successfully (not 404/500)
  await expect(page.locator('h1')).toBeVisible();

  // Check that "Overall ranking" heading exists
  await expect(page.locator('h2:has-text("Overall ranking")')).toBeVisible();

  // Check that "Per question" heading exists  
  await expect(page.locator('h2:has-text("Per question")')).toBeVisible();
});