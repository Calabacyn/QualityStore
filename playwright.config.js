const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    testIgnore: '**/api.test.js',
    fullyParallel: true,

    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { open: 'never' }],
        ['list']
    ],

    use: {
        baseURL: 'http://localhost:3002',


        trace: 'retain-on-failure',

        headless: !!process.env.CI,

        screenshot: 'only-on-failure',
        video: 'on-first-retry',


        launchOptions: {
            slowMo: 200,
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            command: 'cd api && npm start',
            port: 3001,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'cd web && npm run dev -- --host 127.0.0.1 --port 3002',
            port: 3002,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
