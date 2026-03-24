import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
	  react(),
	  tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Requisições para /api serão redirecionadas para sua API
      '/api': {
        target: 'http://201.17.21.186:3000', // O endereço da sua API
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api do caminho final
      },
      '/grafana': {
        target: 'http://10.127.226.224:3000',
        changeOrigin: true,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-WEBAUTH-USER', 'viewer-cdn')
          });
          proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
            proxyReq.setHeader('X-WEBAUTH-USER', 'viewer-cdn')
          })
        }
      }
    }
  }
})
