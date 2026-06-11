
import { test, expect } from '@playwright/test';
import {ProductsPage} from "../../pages/ProductsPage";
import CartPage from "../../pages/cart.page";

test('add product to cart and complete purchase', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // 1. Перейти на страницу товаров
    await productsPage.goto();

    // 2. Добавить товар в корзину
    await productsPage.addProductToCart('Wireless Headphones');

    // 3. Перейти в корзину
    await cartPage.goto();

    // 4. Проверить товар в корзине
    await expect(cartPage.productName).toContainText('Wireless Headphones');
    await expect(cartPage.productPrice).toBeVisible();

    // 5. Перейти к оформлению заказа
    await cartPage.proceedToCheckout();

    // 6. Заполнить данные доставки
    await checkoutPage.fillShippingInfo({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'New York'
    });

    // 7. Подтвердить заказ
    await checkoutPage.completeOrder();

    // 8. Проверить страницу успеха
    await expect(checkoutPage.successMessage).toBeVisible();
    await expect(page).toHaveURL(/order-confirmation/);
});
