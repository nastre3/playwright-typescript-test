import { test, expect } from '@playwright/test';
import {LoginPage} from "../../pages/LoginPage";

test('successful login and dashboard verification', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('valid-user', 'password123');

    // Проверка перехода на dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Проверка элементов dashboard
    await expect(dashboardPage.welcomeMessage).toContainText('Welcome, valid-user');
    await expect(dashboardPage.statsCard).toBeVisible();
    await expect(dashboardPage.recentActivity).toBeVisible();
});
