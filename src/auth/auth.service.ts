import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import type { AccessTokenPayload } from './auth.types';
import { jwtConfig, type TJwtConfig } from '../config/jwt.config';
import type { RefreshTokenPayload } from './auth.types';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly configService: TJwtConfig,
  ) {}

  async registerUser(dto: RegisterDto): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.usersService.createUser(dto);
    const { accessToken, refreshToken } = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { user, accessToken, refreshToken };
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const jwt = this.configService;

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = { sub: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: jwt.access_token_key,
        expiresIn: jwt.access_token_expiry as StringValue,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: jwt.refresh_token_key,
        expiresIn: jwt.refresh_token_expiry as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
  }

  async refreshTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.generateTokens(user);

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
