import { ConfigType, registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dbConfig = registerAs(
  'DB_CONFIG',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'skillswap',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true' ? true : false,
    logging: process.env.DB_LOGGING === 'true' ? true : false,
  }),
);

export type TDBConfig = ConfigType<typeof dbConfig>;

export const AppDataSource = new DataSource(dbConfig());
