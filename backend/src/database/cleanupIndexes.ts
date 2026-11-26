import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

interface MysqlIndexRow {
  Key_name: string;
  Column_name: string;
}

/**
 * Cleans up duplicate `dni` unique indexes accumulated by Sequelize v6
 * `sync({ alter: true })` on MySQL/MariaDB when `unique: true` was set on the
 * column attribute, preventing `ER_TOO_MANY_KEYS` without dropping table data.
 */
export const cleanupDuplicateUserDniIndexes = async (): Promise<void> => {
  if (sequelize.getDialect() !== 'mysql') {
    return;
  }

  const tables = await sequelize.query<Record<string, string>>(
    "SHOW TABLES LIKE 'users'",
    { type: QueryTypes.SELECT },
  );
  if (tables.length === 0) {
    return;
  }

  const rows = await sequelize.query<MysqlIndexRow>('SHOW INDEX FROM `users`', {
    type: QueryTypes.SELECT,
  });

  const duplicateDniKeys = Array.from(
    new Set(
      rows
        .filter(
          (row) =>
            row.Key_name !== 'PRIMARY' &&
            row.Key_name !== 'users_dni_unique' &&
            row.Column_name === 'dni',
        )
        .map((row) => row.Key_name),
    ),
  );

  for (const keyName of duplicateDniKeys) {
    const escapedKey = keyName.replace(/`/g, '``');
    await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${escapedKey}\``);
  }
};
