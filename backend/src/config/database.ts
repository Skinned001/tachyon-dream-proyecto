export const databaseConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'chief_journal',
  username: process.env.DB_USER ?? 'chief_user',
  password: process.env.DB_PASSWORD ?? 'chief_pass',
};
