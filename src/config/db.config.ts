import { ConfigType, registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

function buildDataSourceOptions(): DataSourceOptions {
  const host = process.env.DB_HOST?.trim();
  const username = process.env.DB_USERNAME?.trim();
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME?.trim();

  if (!host || !username || password === undefined || !database) {
    throw new Error(
      'Database env is incomplete. Set DB_HOST, DB_USERNAME, DB_PASSWORD, and DB_NAME in .env (use the same PostgreSQL as on main / shared team credentials).',
    );
  }

  const port = Number(process.env.DB_PORT);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error('DB_PORT must be a positive number.');
  }

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  };
}

export const dbConfig = registerAs('DB_CONFIG', () => buildDataSourceOptions());

export type TDBConfig = ConfigType<typeof dbConfig>;

export const AppDataSource = new DataSource(buildDataSourceOptions());
