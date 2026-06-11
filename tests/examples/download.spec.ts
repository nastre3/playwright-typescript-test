import { test, expect } from '@playwright/test';

test('download file', async ({ page, browser }) => {
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#download-button')
    ]);
    const path = await download.path();
    // Проверка содержимого файла
});
