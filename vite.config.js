import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/mod-eval-dev/' : '/mod-evaluator/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 80,
      host: 'farmroadmap.dynv6.net',
      protocol: 'ws'
    },
    allowedHosts: ['farmroadmap.dynv6.net', 'localhost']
  }
}))
