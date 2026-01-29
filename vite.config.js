import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['redux', 'react-redux', '@reduxjs/toolkit', 'redux-persist'],
          'vendor-ui': ['sweetalert2', 'formik', 'yup', 'axios'],
          // Split microservice routes to separate chunks
          'route-unisync360': ['./src/router/microservices/unisync360/unisync360.jsx'],
          'route-eapproval': ['./src/router/microservices/e_approval/settings.jsx', './src/router/microservices/e_approval/operations.jsx'],
          'route-ict': ['./src/router/microservices/ict_assets/ict-assets.jsx'],
          'route-bi': ['./src/router/microservices/business_intelligence/business-intelligence.jsx'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Optimize dev server
    middlewareMode: false,
  }
})