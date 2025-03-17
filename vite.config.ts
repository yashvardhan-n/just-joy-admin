import { defineConfig , loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const targetUrl = env.VITE_PROXY_SERVER || 'https://just-joy-backend.vercel.app';
  return {
    server: {
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
  };
});