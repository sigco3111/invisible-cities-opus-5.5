import { defineConfig } from 'vite';
export default defineConfig(({ command }) => ({
  // GitHub Pages project site base
  base: command === 'build' ? '/invisible-cities-opus-5.5/' : '/',
  server: { port: 5199, host: '127.0.0.1' },
  build: { chunkSizeWarningLimit: 2000 },
}));
