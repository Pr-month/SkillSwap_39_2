import { Injectable, Inject } from '@nestjs/common';
import {  verify } from 'jsonwebtoken';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';
import { SocketWithUser } from 'src/notification/notification.types';
import { WsException } from '@nestjs/websockets';
import { AccessTokenPayload } from 'src/auth/auth.types';


@Injectable()
export class WsJwtGuard {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: TJwtConfig,
  ) {}

  verifyClient(client: SocketWithUser) {
    const token = client.handshake.headers.auth;
    if (!token || Array.isArray(token)) {
      throw new WsException('No token');
    }

    try {
      const payload = verify(token, this.config.access_token_key) as AccessTokenPayload;
      return payload;
    } catch (e) {
      throw new WsException('Invalid token');
    }
  }
}