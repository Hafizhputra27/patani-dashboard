import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.DEPLOY_BASE || '/', // set to '/patani-dashboard/' for GitHub Pages
  test: { environment: 'jsdom', setupFiles: './src/test-setup.jsx', globals: true },
})
