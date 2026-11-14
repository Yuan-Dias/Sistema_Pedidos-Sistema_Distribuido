import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy reverso para evitar bloqueios de CORS durante a demonstração com os microsserviços Spring Boot
    proxy: {
      '/api/catalogo': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/catalogo/, ''),
      },
      '/api/pedidos': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pedidos/, ''),
      },
      '/api/notificacoes': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notificacoes/, ''),
      },
    },
  },
});
