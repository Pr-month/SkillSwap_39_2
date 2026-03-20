import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import type { StringValue } from "ms";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not defined');
        const expiresIn = process.env.JWT_EXPIRES_IN  as StringValue || '1h';
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
