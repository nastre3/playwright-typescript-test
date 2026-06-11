import { chromium, firefox, webkit } from 'playwright';
import {test} from "@playwright/test";

test.skip('навигация', async ({  }) => {

    // Запускаем браузер (можно выбрать chromium, firefox или webkit)
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Навигация
    await page.goto('https://example.com');
    await page.waitForNavigation(); // ждём завершения навигации

    await browser.close();
});
