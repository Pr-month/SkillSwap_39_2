import {
  Controller,
  UseGuards,
  Get,
  Req,
  Post,
  Body,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';

import {
  ApiUsersGetAll,
  ApiUsersGetMe,
  ApiUsersUpdateMe,
  ApiUsersUpdatePassword,
} from './users.swagger';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiUsersGetAll()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiUsersGetMe()
  async getMe(@Req() req: RequestWithUser): Promise<User> {
    const user = await this.usersService.findById(req.user.sub);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiUsersUpdateMe()
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/me/password')
  @ApiUsersUpdatePassword()
  updatePassword(
    @Req() req: RequestWithUser,
    @Body() updatePasswordDTO: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(req.user, updatePasswordDTO);
  }
}
