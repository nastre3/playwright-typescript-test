import { test, expect } from '@playwright/test';

test.skip('заполнение формы и отправка', async ({ page }) => {
    // 1. Открываем страницу
    await page.goto('https://example.com/login');

    // 2. Заполняем форму
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // 3. Нажимаем кнопку отправки
    await page.click('button[type="submit"]');

    // Для остановки теста и ручной проверки страницы
    await page.pause();

    // 4. Добавляем проверки (expect)

    // Проверка URL после отправки формы
    await expect(page).toHaveURL('https://example.com/dashboard');

    // Проверка наличия элемента на странице
    await expect(page.getByText('Welcome, test@example.com')).toBeVisible();

    // Проверка заголовка страницы
    await expect(page).toHaveTitle(/Dashboard/);

    // Проверка значения поля (например, после перезагрузки страницы)
    await expect(page.locator('#email')).toHaveValue('test@example.com');
});
