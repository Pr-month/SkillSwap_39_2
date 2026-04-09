import { ConfigType, registerAs } from '@nestjs/config';
import passport from 'passport';
import { Gender } from 'src/users/users.enums';

export const appConfig = registerAs('APP_CONFIG', () => ({
  port: Number(process.env.PORT) || 3000,
  hashSalt: Number(process.env.HASH_SALT) || 10,
  adminData: {
    email: process.env.ADMIN_EMAIL || 'admin@mail.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: 'admin',
    birthdate: '2000-01-01',
    gender: Gender.MALE,
    city: 'Ярославль',
    about: ''
  },
}));

export type TAppConfig = ConfigType<typeof appConfig>;
