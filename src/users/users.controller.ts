import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RequestWithUser } from '../auth/types/request-with-user.interface';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: RequestWithUser): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findById(req.user.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...safeUser } = user;

    return safeUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.updateUser(req.user.sub, dto);

    const { password, ...safeUser } = user;

    return safeUser;
  }
}
