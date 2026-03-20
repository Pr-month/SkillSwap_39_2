import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { IRequestWithUser } from '../types/express';
import { User } from '../../users/entities/user.entity';

interface IRefreshTokenPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequestWithUser>();
    const refreshToken = req.cookies?.Refresh;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    let payload: IRefreshTokenPayload;
    try {
      payload = this.jwtService.verify<IRefreshTokenPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user: User | null = await this.usersService.findByEmail(
      payload.email,
    );
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    req.user = user;
    return true;
  }
}
