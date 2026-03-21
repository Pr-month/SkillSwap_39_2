import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from './types/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: RequestWithUser): Promise<{ message: string }> {
    const userId = req.user.sub;
    if (typeof userId !== 'string' || !userId) {
      throw new UnauthorizedException();
    }
    await this.authService.logout(userId);
    return { message: 'Logout successful' };
  }
}
