import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api';

// Express app with the API mounted; shared by the local server (server.ts)
// and the Vercel serverless function (server/vercelEntry.ts)
export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRouter);
  return app;
}
