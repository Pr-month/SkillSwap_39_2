import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestWithUser } from './types/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
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
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: RequestWithUser) {
    return await this.authService.logout(req.user.sub);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

}
