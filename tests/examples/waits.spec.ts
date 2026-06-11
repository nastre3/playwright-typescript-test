import { test, expect } from '@playwright/test';

test('different wait methods', async ({ page }) => {
    // Ждать выполнения условия
    await page.waitForFunction(() => {
        return document.querySelector('.data-loaded') !== null;
    });

    // Жёсткое ожидание (только для отладки)
    await page.waitForTimeout(1000);

    // Ожидание AJAX-запроса
    const [response] = await Promise.all([
        page.waitForResponse(response =>
            response.url().includes('/api/data') && response.status() === 200
        ),
        page.click('#load-data-button')
    ]);

    const data = await response.json();
    expect(data.success).toBe(true);
});

test('Conditional wait and Assertional waits', async ({ page }) => {
    await page.goto('/complex-form');

    // Сначала ждём появления формы
    const form = page.locator('#main-form');
    await form.waitFor({ state: 'visible', timeout: 15000 });

    // Затем проверяем её содержимое
    await expect(form.locator('input[name="email"]')).toBeVisible();
    await expect(form.locator('textarea[name="message"]')).toBeEnabled();

    // Заполняем форму
    await form.fill('input[name="email"]', 'test@example.com');
    await form.fill('textarea[name="message"]', 'Hello');

    // Ждём активации кнопки отправки
    const submitBtn = form.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();

    // Отправляем форму
    await submitBtn.click();

    // Ждём подтверждения
    await expect(page.locator('.success-message')).toHaveText('Сообщение отправлено!');
});
