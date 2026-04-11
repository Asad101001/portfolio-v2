import fs from 'fs';
import path from 'path';

/**
 * A basic Vite plugin to inline HTML files using <include src="./components/foo.html"></include>
 */
function htmlIncludePlugin() {
  return {
    name: 'html-include',
    enforce: 'pre',
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

export default {
  plugins: [htmlIncludePlugin()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        '404': path.resolve(__dirname, '404.html'),
        legaleaseai: path.resolve(__dirname, 'projects/legaleaseai.html'),
        pollpulse: path.resolve(__dirname, 'projects/pollpulse.html'),
        devpulse: path.resolve(__dirname, 'projects/devpulse.html'),
        mogscope: path.resolve(__dirname, 'projects/mogscope.html')
      }
    }
  }
};
