import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mod-evaluator/',
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,      // You can change this if needed
    hmr: {
      clientPort: 80,
      host: 'farmroadmap.dynv6.net',
      protocol: 'ws'
    },
    allowedHosts: ['farmroadmap.dynv6.net', 'localhost']
  }
})
