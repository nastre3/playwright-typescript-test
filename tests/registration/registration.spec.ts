import { test, expect } from '@playwright/test';
import type {RegistrationPage} from "../../pages/RegistrationPage";

test.describe('Registration form validation', () => {
    let registrationPage: RegistrationPage;

    test.beforeEach(async ({ page }) => {
        registrationPage = new RegistrationPage(page);
        await registrationPage.goto();
    });

    // Позитивный сценарий
    test('successful registration with valid data', async () => {
        await registrationPage.register('valid@example.com', 'SecurePass123!', 'SecurePass123!');

        // Проверки
        await expect(registrationPage.page).toHaveURL(/dashboard/);
        await expect(registrationPage.page.getByText('Registration successful')).toBeVisible();
        await expect(registrationPage.page.locator('.user-email')).toHaveText('valid@example.com');
    });

    // Edge case 1: Некорректный email
    test('validation for invalid email format', async () => {
        await registrationPage.register('invalid-email', 'Password123!', 'Password123!');
        await registrationPage.registerButton.click();

        const errors = await registrationPage.getErrorMessages();
        expect(errors).toContain('Please enter a valid email address');
    });

    // Edge case 2: Несовпадение паролей
    test('validation for password mismatch', async () => {
        await registrationPage.register('user@example.com', 'Password123!', 'DifferentPass456!');
        await registrationPage.registerButton.click();

        const errors = await registrationPage.getErrorMessages();
        expect(errors).toContain('Passwords do not match');
    });

    // Edge case 3: Пустые поля
    test('validation for empty required fields', async () => {
        await registrationPage.register('', '', '');
        await registrationPage.registerButton.click();

        const errors = await registrationPage.getErrorMessages();
        expect(errors.length).toBeGreaterThanOrEqual(2);
        expect(errors).toContain('Email is required');
        expect(errors).toContain('Password is required');
    });
});
