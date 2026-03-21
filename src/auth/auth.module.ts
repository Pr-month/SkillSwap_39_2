import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TJwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const jwt = config.get<TJwtConfig>('JWT_CONFIG');
        if (!jwt?.access_token_key) {
          throw new Error('ACCESS_TOKEN_KEY is not configured');
        }
        return {
          secret: jwt.access_token_key,
          signOptions: {
            expiresIn: jwt.access_token_expiry as StringValue,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
