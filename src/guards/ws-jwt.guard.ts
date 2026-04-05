import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { jwtConfig, TJwtConfig } from 'src/config/jwt.config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly configService: TJwtConfig,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<any>();

    const token = client.handshake.auth?.token;

    if (!token) {
      throw new UnauthorizedException('No token');
    }

    try {
      const payload = verify(token, this.configService.access_token_key);
      client.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
