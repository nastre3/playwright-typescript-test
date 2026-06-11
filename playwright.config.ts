import { defineConfig, devices } from '@playwright/test';
import process from 'node:process'
import { funcHelper } from './utils/helpers';
import * as os from 'os'

// Read environment variables from file. https://github.com/motdotla/dotenv
import * as dotenv from 'dotenv'

dotenv.config({ path: './tests/.env', quiet: true })

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
export default defineConfig({
    updateSnapshots: 'missing',

    /* Global test suite settings */
    fullyParallel:   true,
    maxFailures:     parseInt(process.env.MAX_FAILURES) || 500,
    globalTimeout:   parseInt(process.env.GLOBAL_TIMEOUT) || 18000000,

    testDir: './tests',
    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: 'test-results/',

    /* Maximum time one test can run for. */
    timeout: parseInt(process.env.TIMEOUT) || 30000,
    expect:     {
        timeout: 30000,
    },
    forbidOnly: !!process.env.CI,
    retries:    parseInt(process.env.RETRIES) || 0,
    workers:    parseInt(process.env.WORKERS) || 7,
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        actionTimeout: 0,
        baseURL: 'https://practice.sdetunicorns.com',
        // baseURL: funcHelper.getURL(),
        headless: false, // true для безголового режима
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace:             process.env.WHEN_TRACE || 'retain-on-first-failure', // создаст трассировку с шагами и состоянием страницы
        screenshot:        process.env.WHEN_SCREEN || 'only-on-failure',
        // video: 'retain-on-failure',
        acceptDownloads:   true,
        timezoneId:        'Asia/Vladivostok',
        ignoreHTTPSErrors: true,
        // launchOptions: { proxy: { server: '' } },
        // proxy:         { server: '' },
    },
    toHaveScreenshot: {
        maxDiffPixels: 10,
        animations:    'disable',
        caret:         'hide',
    },
    toMatchSnapshot:  {
        maxDiffPixels: 10,
    },
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1900, height: 1000 },
            }
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] }
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] }
        },
    ],

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        [ 'list' ],
        [ 'html', { open: 'never' } ],
        [ 'allure-playwright',
            {
                detail:          true,
                suiteTitle:      false,
                environmentInfo: {
                    os_platform:  os.platform(),
                    node_version: process.version,
                    scope:        process.env.SCOPE,
                    version:      process.env.APP_VERSION,
                    // base_url:     funcHelper.getURL()
                },
            }
        ],
    ],
});
