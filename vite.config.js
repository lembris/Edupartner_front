import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks - loaded once, shared across all routes
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/redux') || id.includes('node_modules/react-redux') || id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/redux-persist')) {
            return 'vendor-redux';
          }
          if (id.includes('node_modules/sweetalert2') || id.includes('node_modules/formik') || id.includes('node_modules/yup') || id.includes('node_modules/axios')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/apexcharts') || id.includes('node_modules/react-apexcharts')) {
            return 'vendor-charts';
          }

          // Lazy-loaded route chunks - only loaded when needed
          if (id.includes('e_approval/settings') || id.includes('e_approval/users') || id.includes('e_approval/operations')) {
            return 'chunk-eapproval';
          }
          if (id.includes('ict_assets/ict-assets')) {
            return 'chunk-ict';
          }
          if (id.includes('unisync360/unisync360')) {
            return 'chunk-unisync360';
          }
          if (id.includes('business_intelligence/business-intelligence')) {
            return 'chunk-bi';
          }
        }
      }
    },
    // Increase chunk size limit (lazy-loaded chunks can be larger)
    chunkSizeWarningLimit: 2000,
    // Optimize build output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      }
    }
  },
  server: {
    // Optimize dev server
    middlewareMode: false,
  }
})