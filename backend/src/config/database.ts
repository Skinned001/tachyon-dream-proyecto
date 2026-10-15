import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

type SupportedDialect = 'postgres' | 'mariadb';

const dialectValue = process.env.DB_DIALECT ?? 'postgres';

if (dialectValue !== 'postgres' && dialectValue !== 'mariadb') {
  throw new Error('DB_DIALECT must be either "postgres" or "mariadb".');
}

const requiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const databaseConfig = {
  dialect: dialectValue as SupportedDialect,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? (dialectValue === 'postgres' ? 5432 : 3306)),
  database: requiredEnvironmentVariable('DB_NAME'),
  username: requiredEnvironmentVariable('DB_USER'),
  password: process.env.DB_PASSWORD ?? '',
};

if (!Number.isInteger(databaseConfig.port) || databaseConfig.port < 1) {
  throw new Error('DB_PORT must be a positive integer.');
}

const sequelizeDialect = databaseConfig.dialect === 'mariadb' ? 'mysql' : 'postgres';

export const sequelize = new Sequelize(databaseConfig.database, databaseConfig.username, databaseConfig.password, {
  dialect: sequelizeDialect,
  host: databaseConfig.host,
  port: databaseConfig.port,
  logging: false,
});
