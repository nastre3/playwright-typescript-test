import { test, expect } from '@playwright/test';

test('iframe interaction', async ({ page }) => {
    const frameLocator = page.frameLocator('#my-iframe');
    await frameLocator.getByLabel('Username').fill('testuser');
    await frameLocator.getByRole('button', { name: 'Submit' }).click();
    await expect(frameLocator.getByText('Success')).toBeVisible();
});
