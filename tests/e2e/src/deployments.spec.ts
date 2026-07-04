import { expect, test } from '@playwright/test';

const deploymentName = process.env.E2E_DEPLOYMENT ?? 'demo-api';

test.describe('Deployments UI', () => {
  test('shows deployment list and opens detail page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('deployment-list')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId(`deployment-link-${deploymentName}`).click();

    await expect(page.getByRole('heading', { name: deploymentName })).toBeVisible();
    await page.getByRole('tab', { name: 'Pods' }).click();
    await expect(page.getByTestId('pod-table')).toBeVisible({ timeout: 30_000 });
  });
});
