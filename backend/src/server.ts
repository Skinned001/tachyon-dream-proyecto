import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { sequelize } from './config/database.js';
import { setupAssociations } from './database/associations.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use(errorMiddleware);

const startServer = async (): Promise<void> => {
  setupAssociations();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error('Unable to start the backend server:', error);
  process.exitCode = 1;
});
