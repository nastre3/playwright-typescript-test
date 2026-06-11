import { test, expect } from '@playwright/test';

test('viewport test', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Проверка мобильной версии
});
