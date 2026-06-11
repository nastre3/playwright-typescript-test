mport { Page, Locator } from '@playwright/test';

export class RegistrationPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly registerButton: Locator;
    readonly errorMessages: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByLabel('Email');
        this.passwordInput = page.getByLabel('Password');
        this.confirmPasswordInput = page.getByLabel('Confirm Password');
        this.registerButton = page.getByRole('button', { name: 'Register' });
        this.errorMessages = page.locator('.error-message');
    }

    async goto() {
        await this.page.goto('/register');
    }

    async register(email: string, password: string, confirmPassword: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(confirmPassword);
        await this.registerButton.click();
    }

    async getErrorMessages() {
        const messages = await this.errorMessages.allTextContents();
        return messages.filter(msg => msg.trim().length > 0);
    }
}

