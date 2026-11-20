import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        v2: resolve(process.cwd(), 'v2.html'),
        v3: resolve(process.cwd(), 'v3.html')
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  }
});
