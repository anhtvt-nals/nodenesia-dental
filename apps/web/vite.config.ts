import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
  preview: {
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
  build: {
    // Three.js ships as a large, separately code-split vendor chunk.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          three: ['three'],
        },
      },
    },
  },
});
