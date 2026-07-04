import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill('admin@dpd.local');
  await page.getByTestId('login-password').fill('Admin123!');
  await page.getByTestId('login-submit').click();
  await page.waitForURL('/');
  await page.context().storageState({ path: authFile });
});
