import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import jsconfigPaths from 'vite-jsconfig-paths'
import svgr from 'vite-plugin-svgr'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      jsconfigPaths(),
      svgr(),
      // Only use basicSsl in development
      mode === 'development' && basicSsl()
    ].filter(Boolean),
    server: {
      https: mode === 'development',
    },
    build: {
      // Optimize build output
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            'charts-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
          }
        }
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    }
  }
})
