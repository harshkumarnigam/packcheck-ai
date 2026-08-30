import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://packcheck-ai-api.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },

  preview: {
    allowedHosts: true,
  },
})