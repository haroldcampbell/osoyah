import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:8723',
  },
	reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }]],
	webServer: {
		command: 'npm run start -- --host 127.0.0.1 --port 8723',
		url: 'http://127.0.0.1:8723',
		reuseExistingServer: !process.env.CI,
	},
});
