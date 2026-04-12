import {
  Controller,
  UseGuards,
  Get,
  Req,
  NotFoundException,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RequestWithUser } from 'src/auth/types/request-with-user.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей успешно получен',
    type: [User],
  })
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Данные профиля успешно получены',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getMe(@Req() req: RequestWithUser): Promise<User> {
    const user = await this.usersService.findById(req.user.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Обновить данные своего профиля' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Профиль успешно обновлен',
    type: User,
  })
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(req.user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/me/password')
  @ApiOperation({ summary: 'Изменить пароль пользователя' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 201, description: 'Пароль успешно изменен' })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ' })
  updatePassword(
    @Req() req: RequestWithUser,
    @Body() updatePasswordDTO: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(req.user, updatePasswordDTO);
  }
}
