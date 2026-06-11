import { Page, Locator } from '@playwright/test';

export class TablePage {
    readonly page: Page;
    readonly tableRows: Locator;
    readonly statusFilter: Locator;
    readonly nameSortButton: Locator;
    readonly dateSortButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tableRows = page.locator('tbody tr');
        this.statusFilter = page.locator('#status-filter');
        this.nameSortButton = page.locator('.sort-button[data-column="name"]');
        this.dateSortButton = page.locator('.sort-button[data-column="date"]');
    }

    async goto() {
        await this.page.goto('/table-page');
    }

    // Пользовательский метод: фильтрация по статусу
    async filterByStatus(status: string) {
        await this.statusFilter.selectOption(status);
        // Ждём обновления таблицы после фильтрации
        await this.tableRows.first().waitFor({ state: 'visible' });
    }

    // Пользовательский метод: сортировка по имени (A–Z)
    async sortByNameAsc() {
        await this.nameSortButton.click();
        // Ждём завершения сортировки (например, исчезновения индикатора загрузки)
        await this.page.locator('.loading-spinner').waitFor({ state: 'hidden' });
    }

    // Пользовательский метод: сортировка по дате (новые сначала)
    async sortByDateDesc() {
        await this.dateSortButton.click();
        await this.page.locator('.loading-spinner').waitFor({ state: 'hidden' });
    }
}
