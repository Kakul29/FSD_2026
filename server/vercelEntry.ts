import express from 'express';
import { createApp } from './app';
import { connectDB } from './db';

// Vercel serverless entry: connect to MongoDB once per warm instance, then hand off to the API
let dbReady: Promise<boolean> | null = null;

const app = express();
app.use(async (_req, _res, next) => {
  if (!dbReady) dbReady = connectDB();
  await dbReady;
  next();
});
app.use(createApp());

export default app;
