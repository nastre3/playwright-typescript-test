import {type Page, test as base} from '@playwright/test';

type AuthFixtures = {
    authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
    authenticatedPage: async ({ page }, use) => {
        // Аутентификация перед тестом
        await page.goto('/login');
        await page.fill('#username', 'test-user');
        await page.fill('#password', 'password123');
        await page.click('#login-button');
        await page.waitForURL('/dashboard');

        await use(page);

        // Очистка после теста
        await page.click('#logout-button');
    }
});

export { expect } from '@playwright/test';
