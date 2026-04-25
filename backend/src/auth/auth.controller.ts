import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestWithUser } from './types/request-with-user.interface';
import { User } from 'src/users/entities/user.entity';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { IRequestWithUser } from './types/express';
import {
  ApiAuthLogin,
  ApiAuthLogout,
  ApiAuthRefresh,
  ApiAuthRegister,
} from './auth.swagger';
import { JwtAuthGuard } from './guards/jwtAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiAuthLogin()
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  @ApiAuthRegister()
  async register(
    @Body() dto: RegisterDto,
  ): Promise<{ userId: string; accessToken: string; refreshToken: string }> {
    const { user, accessToken, refreshToken } =
      await this.authService.registerUser(dto);

    return {
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiAuthRefresh()
  async refresh(
    @Req() req: IRequestWithUser,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user: User = req.user!;
    return this.authService.refreshTokens(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiAuthLogout()
  async logout(@Req() req: RequestWithUser) {
    return await this.authService.logout(req.user.sub);
  }
}
