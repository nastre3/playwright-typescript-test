import { test, expect } from '@playwright/test';

test('API request example', async ({ request }) => {
    // GET-запрос
    const response = await request.get('/api/users/1');
    expect(response.status()).toBe(200);
    const user = await response.json();
    expect(user.name).toBe('John Doe');

    // POST-запрос
    const newUser = await request.post('/api/users', {
        data: {
            name: 'Jane Doe',
            email: 'jane@example.com'
        }
    });
    expect(newUser.status()).toBe(201);
});

test('mock API response', async ({ page }) => {
    await page.route('**/api/users*', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                { id: 1, name: 'Mock User 1' },
                { id: 2, name: 'Mock User 2' }
            ])
        });
    });

    await page.goto('/users');
    await expect(page.getByText('Mock User 1')).toBeVisible();
});

test('API precondition + UI test', async ({ page, request }) => {
    // Создаём данные через API
    const userResponse = await request.post('/api/users', {
        data: { name: 'Test User', email: 'test@example.com' }
    });
    const user = await userResponse.json();

    // Проверяем в UI
    await page.goto(`/users/${user.id}`);
    await expect(page.getByText(user.name)).toBeVisible();
});
