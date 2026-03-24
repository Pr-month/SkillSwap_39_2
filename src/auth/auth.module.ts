import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { TJwtConfig } from '../config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';

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
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
