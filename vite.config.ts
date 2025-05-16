// vite.config.ts
// @ts-ignore - Ignore type errors for Vite modules
import { defineConfig } from 'vite';
// @ts-ignore - Ignore type errors for plugin-react
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Make sure static files are copied correctly
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  // Add this to resolve path aliasing issues if needed
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});