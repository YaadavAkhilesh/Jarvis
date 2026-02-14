import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
      'process.env.BRIDGE_URL': JSON.stringify(env.VITE_BRIDGE_URL || 'http://localhost:5000'),
    },
    server: {
      port: 5173,
      strictPort: true,
    }
  };
});