import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
  alias: {
    // 'leaflet/dist/leaflet.css': '/cypress/support/mockStyles.js',
  }
},
  component: {
    devServer: {
  framework: 'react',
      bundler: 'vite',
    },
  },
  
  esbuild: {
    target: 'esnext', // Cambia esto a 'esnext' para usar las últimas características de JavaScript
  },
  plugins: [
    react(),
    tailwindcss() // agregar el plugin de Tailwind CSS
  ],
})
