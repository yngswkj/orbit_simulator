import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const MANUAL_CHUNK_GROUPS: Array<[string, string[]]> = [
  ['react-vendor', ['react', 'react-dom', 'react/jsx-runtime', 'scheduler']],
  ['three-core', ['three']],
  ['three-ecosystem', ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'postprocessing']],
  ['ui-vendor', ['lucide-react', 'react-joyride', 'leva']],
  ['state-vendor', ['zustand', 'uuid', 'type-fest', 'use-sync-external-store']],
  ['animation-vendor', ['gsap']],
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel uses root path, GitHub Pages uses /orbit_simulator/
  base: process.env.VERCEL ? '/' : '/orbit_simulator/',
  build: {
    // `three` ships as a large single ESM module; after vendor splitting the only
    // remaining warning is that library chunk, so use a threshold that reflects it.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          for (const [chunkName, packages] of MANUAL_CHUNK_GROUPS) {
            if (packages.some(pkg => id.includes(`/node_modules/${pkg}/`) || id.includes(`\\node_modules\\${pkg}\\`))) {
              return chunkName
            }
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
