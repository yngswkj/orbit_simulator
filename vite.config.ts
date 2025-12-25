import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel uses root path, GitHub Pages uses /orbit_simulator/
  base: process.env.VERCEL ? '/' : '/orbit_simulator/',
})
