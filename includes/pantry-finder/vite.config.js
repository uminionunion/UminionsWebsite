import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    outDir: path.resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html'),
      output: {
        entryFileNames: 'pantry-finder.js',
        assetFileNames: 'pantry-finder.[ext]',
      },
    },
  },
});
