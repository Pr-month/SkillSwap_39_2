import { ConfigType, registerAs } from '@nestjs/config';

export const swaggerConfig = registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'SkillSwap API',
  description:
    process.env.SWAGGER_DESCRIPTION ||
    'API documentation for SkillSwap platform',
  version: process.env.SWAGGER_VERSION || '1.0',
  path: process.env.SWAGGER_PATH || 'api/docs',
  enabled: process.env.SWAGGER_ENABLED || process.env.NODE_ENV !== 'production',
}));

export type TSwaggerConfig = ConfigType<typeof swaggerConfig>;
