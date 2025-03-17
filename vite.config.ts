import { defineConfig , loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const targetUrl = env.VITE_PROXY_SERVER;
  return {
    server: {
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
        },
      },
      host: true,
      cors: true,
      allowedHosts: true,
    },
    plugins: [react()],
  };
});