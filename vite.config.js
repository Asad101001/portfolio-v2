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
          const filePath = path.resolve(process.cwd(), src);
          return fs.readFileSync(filePath, 'utf-8');
        } catch (e) {
          console.error(`Could not include file ${src}`, e);
          return match;
        }
      });
    }
  };
}

export default {
  plugins: [htmlIncludePlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        legaleaseai: path.resolve(__dirname, 'projects/legaleaseai.html')
      }
    }
  }
};
