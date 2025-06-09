import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/__admin': {
        target: 'http://os.wiremock.server.qa.17u.cn',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
