import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

export const ApiUsersGetAll = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список всех пользователей' }),
    ApiResponse({
      status: 200,
      description: 'Список пользователей успешно получен',
      type: [User],
    }),
  );
};

export const ApiUsersGetMe = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Получить данные текущего пользователя' }),
    ApiResponse({
      status: 200,
      description: 'Данные профиля успешно получены',
      type: User,
    }),
    ApiResponse({ status: 404, description: 'Пользователь не найден' }),
  );
};

export const ApiUsersUpdateMe = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить данные своего профиля' }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: 200,
      description: 'Профиль успешно обновлен',
      type: User,
    }),
  );
};

export const ApiUsersUpdatePassword = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Изменить пароль пользователя' }),
    ApiBody({ type: UpdatePasswordDto }),
    ApiResponse({ status: 201, description: 'Пароль успешно изменен' }),
    ApiResponse({ status: 401, description: 'Неавторизованный доступ' }),
  );
};
