import {
  Controller,
  Get,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RequestWithUser } from '../auth/types/request-with-user.interface';
import { User } from './entities/user.entity';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RequestWithUser } from '../auth/types/request-with-user.interface';

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
  
  @Post('/me/password')
  updatePassword(@Req() req: RequestWithUser, @Body() updatePasswordDTO: UpdatePasswordDto) {
    return this.usersService.updatePassword(req.user, updatePasswordDTO);
  }
}
