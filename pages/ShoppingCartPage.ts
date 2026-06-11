import { Page, Locator } from '@playwright/test';

export class ShoppingCartPage {
    readonly page: Page;
    readonly cartItems: Locator;
    readonly totalPrice: Locator;
    readonly checkoutButton: Locator;
    readonly emptyCartMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartItems = page.locator('.cart-item');
        this.totalPrice = page.locator('.total-price');
        this.checkoutButton = page.getByRole('button', { name: 'Proceed to Checkout' });
        this.emptyCartMessage = page.locator('.empty-cart');
    }

    async goto() {
        await this.page.goto('/cart');
    }

    async getItemCount() {
        return await this.cartItems.count();
    }

    async getTotalPrice() {
        const priceText = await this.totalPrice.textContent();
        return parseFloat(priceText!.replace('$', ''));
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
    }
}
