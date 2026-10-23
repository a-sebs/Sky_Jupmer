import { defineConfig } from 'vite';

// base relativa: funciona en GitHub Pages sin importar el nombre del repositorio
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 2000, // Phaser pesa ~1.5 MB
  },
});
