import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
    readonly products: Locator;
    readonly filterButton: Locator;

    constructor(page: Page) {
        super(page);
        this.products = page.locator('.product-card');
        this.filterButton = page.getByRole('button', { name: 'Filter' });
    }

    async goto() {
        await this.page.goto('/products');
        await this.waitForPageLoad();
    }

    async addProductToCart(productName: string) {
        const product = this.products.filter({ hasText: productName });
        await product.getByRole('button', { name: 'Add to Cart' }).click();
        await this.page.getByText('Added to cart').waitFor({ state: 'visible' });
    }
}
