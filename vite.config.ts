import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Root hosting is the safe default (Vercel/local preview). GitHub Pages
  // explicitly supplies its repository subpath in the deployment workflow.
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    allowedHosts: ['898f0426dc5491b55b32c17caddbbe54.proxyhub.cloud'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
