import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api → Express server so there are no CORS issues in dev
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Do NOT rewrite — keep /api prefix so Express routes match
      }
    }
  }
});
