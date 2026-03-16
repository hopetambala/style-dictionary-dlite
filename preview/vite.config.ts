import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  base: '/style-dictionary-dlite/',
  publicDir: path.resolve(__dirname, '../dist'),
  server: {
    open: '/index.html',
  },
  build: {
    outDir: path.resolve(__dirname, '../preview-dist'),
    emptyOutDir: true,
  },
});
