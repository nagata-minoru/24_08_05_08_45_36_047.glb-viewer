import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: `http://localhost:${PORT}/24_08_05_08_45_36_047.glb-viewer/`,
  },
  projects: [{
    name: 'chromium', use: { ...devices['Desktop Chrome'] },
  }],
  // 本番ビルドを vite preview で配信して確かめる
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort --open false`,
    url: `http://localhost:${PORT}/24_08_05_08_45_36_047.glb-viewer/`,
    reuseExistingServer: !process.env.CI,
  },
});
