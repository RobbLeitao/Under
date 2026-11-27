import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: true },
  // Phaser pesa ~1.2 MB minificado; el aviso de 500 kB no aplica.
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 1500 },
});
