import { defineConfig } from 'vite';
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
  // Copy .well-known directory to build output
  publicDir: 'public',
});