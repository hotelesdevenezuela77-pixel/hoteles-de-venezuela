import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react-is': isProd
          ? 'react-is/cjs/react-is.production.js'
          : 'react-is/cjs/react-is.development.js',
      },
    },
    optimizeDeps: {
      include: ['react-is'],
    },
  };
})
