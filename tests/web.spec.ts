import { test, expect } from '@playwright/test';

test('onet_m6.html page contains required headings', async ({ page }) => {
  // Navigate to the page
  await page.goto('/onet_m6.html');

  // Check that "Overall ranking" heading exists
  await expect(page.getByRole('heading', { name: 'Overall ranking' })).toBeVisible();

  // Check that "Per question" heading exists  
  await expect(page.getByRole('heading', { name: 'Per question' })).toBeVisible();
});