import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      input: path.resolve(__dirname, 'src', 'index.html')
    }
  },
  base: '/24_08_05_08_45_36_047.glb-viewer/',
  server: {
    open: true
  }
});
