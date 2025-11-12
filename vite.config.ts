import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: false,
    minify: 'esbuild',
    reportCompressedSize: false,
  },
  resolve: {
    conditions: mode === 'development' ? ['development', 'browser', 'module'] : ['production', 'browser', 'module'],
  },
  esbuild: {
    legalComments: 'none',
  },
  server: {
    port: 5175,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(
      mode === 'development'
        ? {
            babel: {
              plugins: ['react-dev-locator'],
            },
          }
        : {}
    ),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
}))
