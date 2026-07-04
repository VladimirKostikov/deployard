import { expect, test } from '@playwright/test';

test('health indicator is visible in header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('banner')).toBeVisible();
});
