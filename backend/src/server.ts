import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes/api.routes';
import { initSocketIO } from './services/socketService';
import { startScheduler } from './services/schedulerService';

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io & Scheduler
initSocketIO(server);
startScheduler();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Hapkido Padang Panjang API Server Running' });
});

// API Router
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sistem Informasi Dojang Hapkido API', timestamp: new Date() });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 Backend Dojang Hapkido Server running on http://localhost:${PORT}`);
  });
}

export default app;
