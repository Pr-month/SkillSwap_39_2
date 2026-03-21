import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { UserTokenSubject } from '../users/entities/user.entity';
import { TJwtConfig } from '../config/jwt.config';
import type { AccessTokenPayload, RefreshTokenPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async registerUser(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const user = await this.usersService.createUser(email, password);
    const { accessToken, refreshToken } = this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { user, accessToken, refreshToken };
  }

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.getTokens(user);
  }

  private async getTokens(user: UserTokenSubject): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const jwt = this.configService.get<TJwtConfig>('JWT_CONFIG');
    if (!jwt) {
      throw new UnauthorizedException('Auth configuration error');
    }

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const refreshPayload: RefreshTokenPayload = { sub: user.id };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      expiresIn: jwt.access_token_expiry as StringValue,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: jwt.refresh_token_key,
      expiresIn: jwt.refresh_token_expiry as StringValue,
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
  }
}
