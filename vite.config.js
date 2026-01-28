import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Changed from '/crm/'
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'edupartnersintl.com',
      'www.edupartnersintl.com',
      '76.13.31.181',
      'localhost'
    ]
  }
})
