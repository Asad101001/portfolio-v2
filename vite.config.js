import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';

/**
 * A basic Vite plugin to inline HTML files using <include src="./components/foo.html"></include>
 */
function htmlIncludePlugin() {
  return {
    name: 'html-include',
    enforce: 'pre',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.html') && file.includes('components')) {
        server.ws.send({ type: 'full-reload', path: '*' });
      }
    },
    transformIndexHtml(html) {
      return html.replace(/<include\s+src="([^"]+)"><\/include>/g, (match, src) => {
        try {
          // Standardize on root-relative paths starting with /
          const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
          const filePath = path.resolve(process.cwd(), cleanSrc);
          return fs.readFileSync(filePath, 'utf-8');
        } catch (e) {
          console.error(`Could not include file ${src} at resolved path ${path.resolve(process.cwd(), src)}`, e);
          return match;
        }
      });
    }
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    htmlIncludePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'jsdelivr-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // keep console for dev experience easter egg
        drop_debugger: true,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      }
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        '404': path.resolve(__dirname, '404.html'),
        legaleaseai: path.resolve(__dirname, 'projects/legaleaseai.html'),
        pollpulse: path.resolve(__dirname, 'projects/pollpulse.html'),
        devpulse: path.resolve(__dirname, 'projects/devpulse.html'),
        mogscope: path.resolve(__dirname, 'projects/mogscope.html'),
        asaaniyat: path.resolve(__dirname, 'projects/asaaniyat.html'),
        demo: path.resolve(__dirname, 'demo.html')
      },
      output: {
        // Code-split by module — keeps initial bundle minimal
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group vendor libs into their own chunk
            if (id.includes('lenis') || id.includes('swup')) return 'vendor-scroll';
            if (id.includes('gsap')) return 'vendor-gsap';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor';
          }
          // Split our heavy modules into separate chunks
          if (id.includes('widgets')) return 'widgets';
          if (id.includes('twitter')) return 'twitter';
          if (id.includes('terminal')) return 'terminal';
          if (id.includes('webgl')) return 'webgl';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    }
  }
});
