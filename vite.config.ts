import { defineConfig , loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      proxy: {
        '/api': env.VITE_PROXY_SERVER,
      },
    },
    plugins: [react()],
  };
});