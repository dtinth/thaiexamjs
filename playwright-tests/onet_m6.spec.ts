import { test, expect } from '@playwright/test';

test('Onet M6 page has correct elements', async ({ page }) => {
  try {
    await page.goto('http://localhost:3000/onet_m6.html');

    // Assert that an element with the text "Overall ranking" exists.
    // Increased timeout to 10 seconds.
    await expect(page.getByText('Overall ranking')).toBeVisible({ timeout: 10000 });

    // Assert that an element with the text "Per question" exists.
    // Increased timeout to 10 seconds.
    await expect(page.getByText('Per question')).toBeVisible({ timeout: 10000 });

  } catch (error) {
    // Save a screenshot on failure.
    const screenshotPath = `playwright-tests/failure-screenshot-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

    // Print page HTML on failure.
    const htmlContent = await page.content();
    console.log('Page HTML on failure:', htmlContent);
    
    // Re-throw the error to ensure the test is still marked as failed.
    throw error;
  }
});
