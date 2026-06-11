import { test, expect } from '@playwright/test';
import {TablePage} from "../../pages/TablePage";

test('table filtering and sorting', async ({ page }) => {
    const tablePage = new TablePage(page);
    await tablePage.goto();

    // Фильтрация
    await tablePage.filterByStatus('Active');
    await expect(tablePage.tableRows).toHaveCount(greaterThan(0)); // Есть строки
    await expect(tablePage.tableRows).toHaveText(/Active/i); // Все содержат "Active"


    // Сортировка по имени
    await tablePage.sortByNameAsc();
    await page.locator('.loading').waitFor({ state: 'hidden' }); // Ждём загрузки
    const names = await tablePage.nameCells.allTextContents();
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    await expect(names).toEqual(sortedNames);

    // Сортировка по дате
    await tablePage.sortByDateDesc();
    await page.locator('.sorting').waitFor({ state: 'hidden' });
    const dateTexts = await tablePage.dateCells.allTextContents();
    const dates = dateTexts.map(d => new Date(d));
    for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
    }
});
