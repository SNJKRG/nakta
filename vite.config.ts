import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

// Две страницы: / и /menu/ (прямая ссылка для QR-кода на столе).
export default defineConfig({
  plugins: [react(), imagetools()],
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), menu: resolve(import.meta.dirname, 'menu/index.html') },
    },
  },
})
