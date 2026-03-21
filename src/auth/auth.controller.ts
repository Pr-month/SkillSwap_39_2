import { Controller, Post, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { IRequestWithUser } from './types/express';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: IRequestWithUser,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user: User = req.user!;
    return this.authService.refreshTokens(user);
  }
}
