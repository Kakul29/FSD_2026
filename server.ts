// Load .env before any other module reads process.env (e.g. JWT_SECRET in auth middleware)
import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './server/db';
import { createApp } from './server/app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApp();
  const server = http.createServer(app);
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Connect Database (MongoDB or resilient memory store)
  await connectDB();

  // Development: Mount Vite dev server middleware
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // HMR disabled in AI Studio container environment
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[LabelLens] Vite dev middleware mounted with hmr: false');
  } else {
    // Production: Serve built static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[LabelLens Server] Application running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[LabelLens Server] Failed to initialize server:', err);
  process.exit(1);
});
