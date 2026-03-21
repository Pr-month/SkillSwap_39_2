import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { TJwtConfig } from '../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const jwt = this.configService.get<TJwtConfig>('JWT_CONFIG');
    if (!jwt) {
      throw new UnauthorizedException('Auth configuration error');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwt.access_token_expiry as StringValue,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: jwt.refresh_token_key,
        expiresIn: jwt.refresh_token_expiry as StringValue,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
  }
}
