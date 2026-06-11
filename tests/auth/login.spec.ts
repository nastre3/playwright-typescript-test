import { test, expect } from '@playwright/test';
import {LoginPage} from "../../pages/LoginPage";
import {loginTestCases} from "../../data/login.data";


test('successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('valid-user', 'password123');
    await expect(page).toHaveURL('/dashboard');
});

test.describe('Parameterized login tests', () => {
    loginTestCases.forEach((testCase) => {
        test(`test case ${testCase.id}: ${testCase.expected}`, async ({ page }) => {
            const loginPage = new LoginPage(page);
            await loginPage.goto();
            await loginPage.login(testCase.username, testCase.password);

            if (testCase.expected === 'success') {
                await expect(page).toHaveURL('/dashboard');
            } else {
                await expect(loginPage.errorMessage).toBeVisible();
            }
        });
    });
});
