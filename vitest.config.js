import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import jsconfigPaths from 'vite-jsconfig-paths'

export default defineConfig({
  plugins: [react(), jsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        'dist/',
      ]
    }
  },
})
