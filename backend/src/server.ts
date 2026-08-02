import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './routes/api.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Router
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sistem Informasi Dojang Hapkido API', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Dojang Hapkido Server running on http://localhost:${PORT}`);
});
