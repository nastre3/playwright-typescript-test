import { test, expect } from '@playwright/test';
import {ProductsPage} from "../../pages/ProductsPage";
import {ShoppingCartPage} from "../../pages/ShoppingCartPage";

test('purchase flow with cart verification', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new ShoppingCartPage(page);

    // 1. Добавляем товар в корзину
    await productsPage.goto();
    await productsPage.addProductToCart('Wireless Headphones');

    // 2. Переходим в корзину
    await cartPage.goto();

    // Проверки в корзине
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartItems.first()).toContainText('Wireless Headphones');

    const initialTotal = await cartPage.getTotalPrice();
    expect(initialTotal).toBeGreaterThan(0);

    // 3. Увеличиваем количество
    await cartPage.cartItems.getByRole('button', { name: '+' }).click();
    const updatedTotal = await cartPage.getTotalPrice();
    expect(updatedTotal).toBeGreaterThan(initialTotal);

    // 4. Удаляем товар (edge case: пустая корзина)
    await cartPage.cartItems.getByRole('button', { name: 'Remove' }).click();
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.cartItems).toHaveCount(0);

    // 5. Возвращаемся к покупкам
    await page.goto('/products');
    await productsPage.addProductToCart('Cotton T-Shirt');
    await cartPage.goto();
    await expect(cartPage.cartItems).toContainText('Cotton T-Shirt');

    // 6. Оформляем заказ
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/checkout/);
});
