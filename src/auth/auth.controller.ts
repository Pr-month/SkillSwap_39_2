import { Controller, Post, Body, HttpCode, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestWithUser } from './types/request-with-user.interface';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') @HttpCode(201) async register(
    @Body() dto: RegisterDto,
  ): Promise<{ userId: string; accessToken: string; refreshToken: string }> {
    const { user, accessToken, refreshToken } =
      await this.authService.registerUser(dto.email, dto.password);

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }
  @Post('logout') @HttpCode(200) async logout(
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.authService.logout(req.user.id);
    return { message: 'Logout successful' };
  }
}
