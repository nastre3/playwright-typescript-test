import {test} from "../fixtures";
import {expect} from "@playwright/test";

// test('test with custom fixture', async ({ apiRequest }) => {
//     const response = await apiRequest.get('/api/status');
//     expect(response.status()).toBe(200);
// });

test('test with authenticated user', async ({ authenticatedPage }) => {
    // Страница уже авторизована
    await authenticatedPage.goto('/profile');
    await expect(authenticatedPage.getByText('Profile')).toBeVisible();
});
