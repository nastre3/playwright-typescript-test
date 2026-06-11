import { Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.getByLabel('Username');
        this.passwordInput = page.getByLabel('Password');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.errorMessage = page.getByText('Invalid credentials');
    }

    async goto() {
        await this.page.goto('/login');
    }

    async login(username: string, password: string) {
        console.log(`Logging in with username: ${username}`);
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        console.log('Clicking login button...');
        await this.loginButton.click();
    }


    async getErrorMessage() {
        return await this.errorMessage.textContent();
    }
}
