import { ConfigType, registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('JWT_CONFIG', () => ({
  access_token_key: process.env.ACCESS_TOKEN_KEY || 'secret-dev',
  access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY || '10m',
  refresh_token_key: process.env.REFRESH_TOKEN_KEY || 'secret-dev',
  refresh_token_expiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
}));

export type TJwtConfig = ConfigType<typeof jwtConfig>;
