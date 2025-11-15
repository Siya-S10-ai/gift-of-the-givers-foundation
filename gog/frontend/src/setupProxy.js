// filepath: c:\Users\Thandiwe\Desktop\Software Development 2025\Applied Programming\Part 3 - Testing\gift-of-the-givers-foundation\gog\frontend\src\setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5211',
      changeOrigin: true,
      secure: false,
    })
  );
};