const { defineConfig } = require('vite');

module.exports = defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  }
});
