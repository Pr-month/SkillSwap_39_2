import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import type { TJwtConfig } from '../../config/jwt.config';
import type { RefreshTokenPayload } from '../auth.types';

/** Refresh token from cookie (Refresh / refresh), Bearer header, or JSON body `refreshToken`. */
export function extractRefreshToken(req: Request): string | null {
  const cookies = req.cookies as Record<string, string> | undefined;
  const fromCookie = cookies?.Refresh ?? cookies?.refresh;
  if (fromCookie) {
    return fromCookie;
  }
  const bearer = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (bearer) {
    return bearer;
  }
  const body = req.body as { refreshToken?: string } | undefined;
  if (body?.refreshToken && typeof body.refreshToken === 'string') {
    return body.refreshToken;
  }
  return null;
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwt = configService.get<TJwtConfig>('JWT_CONFIG');
    const secret =
      jwt?.refresh_token_key ?? process.env.REFRESH_TOKEN_KEY ?? 'secret-dev';

    super({
      jwtFromRequest: extractRefreshToken,
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshTokenPayload) {
    const token = extractRefreshToken(req);
    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const user = await this.usersService.findById(payload.sub);

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenOk = await bcrypt.compare(token, user.refreshToken);

    if (!refreshTokenOk) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
