import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // ブラウザのふりをする設定
    globals: true,        // describeやtestをimportなしで使えるようにする
  },
});