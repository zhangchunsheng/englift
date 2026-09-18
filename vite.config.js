import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      // 本地开发时，词典 API 转发到线上 PHP 代理
      '/api': {
        target: 'https://englift.luomor.com',
        changeOrigin: true,
      },
    },
  },
})
