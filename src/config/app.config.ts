import { ConfigType, registerAs } from '@nestjs/config';
import passport from 'passport';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  hashSalt: Number(process.env.HASH_SALT) || 10,

  adminData: {
    email: process.env.ADMIN_EMAIL || 'admin@mail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  }
}));

export type TAppConfig = ConfigType<typeof appConfig>;
