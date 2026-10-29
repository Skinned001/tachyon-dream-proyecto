import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import { setupAssociations } from './database/associations.js';
import app from './app.js';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

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
