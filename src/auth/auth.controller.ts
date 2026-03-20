import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body() body: { email: string; password: string },
  ): Promise<{ userId: number; accessToken: string; refreshToken: string }> {
    const { user, accessToken, refreshToken } =
      await this.authService.registerUser(body.email, body.password);
    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }
}
