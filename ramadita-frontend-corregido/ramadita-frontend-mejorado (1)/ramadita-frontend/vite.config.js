import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // En desarrollo, Vite corre en :5173 y Spring Boot en :8080.
      // Esto redirige las llamadas /api y /login/logout al backend real,
      // evitando problemas de CORS sin tener que configurar nada en Spring.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        withCredentials: true,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // IMPORTANTE: /login es ambiguo -- es a la vez la pagina de React
        // (GET, ruta del SPA) y el endpoint de Spring Security que procesa
        // el formulario (POST). Si dejamos pasar los GET al backend, este
        // responde un error JSON en vez de servir la pagina de React.
        // Por eso solo se reenvia al backend cuando es POST; los GET los
        // sigue sirviendo Vite normalmente (asi React Router maneja la ruta).
        bypass: (req) => {
          if (req.method !== 'POST') {
            return req.url;
          }
        },
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // WebSocket de avisos en tiempo real para la pantalla de Cocina.
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
})
