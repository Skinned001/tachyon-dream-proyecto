import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use(errorMiddleware);

export default app;
