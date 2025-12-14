import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 배포 및 빌드를 위한 Vite 설정 파일
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
  }
});