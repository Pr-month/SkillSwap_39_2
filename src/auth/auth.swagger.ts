import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export function ApiAuthLogin() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Авторизация пользователя' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 201,
      description: 'Пользователь успешно авторизован',
    }),
    ApiResponse({
      status: 401,
      description: 'Некорректная почта или пароль',
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации',
    }),
    ApiResponse({
      status: 500,
      description: 'Внутренняя ошибка сервера',
    }),
  );
}

export function ApiAuthRegister() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Регистрация пользователя' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'Пользователь успешно зарегистрирован',
    }),
    ApiResponse({
      status: 409,
      description: 'Пользователь уже зарегистрирован',
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации',
    }),
    ApiResponse({
      status: 500,
      description: 'Внутренняя ошибка сервера',
    }),
  );
}

export function ApiAuthRefresh() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Обновление токена' }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Данные авторизации успешно обновлены',
    }),
    ApiResponse({
      status: 401,
      description: 'Некорректный accessToken или refreshToken',
    }),
    ApiResponse({
      status: 500,
      description: 'Внутренняя ошибка сервера',
    }),
  );
}

export function ApiAuthLogout() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Выход из профиля' }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Выход из профиля выполнен',
    }),
    ApiResponse({
      status: 401,
      description: 'Пользователь не авторизован',
    }),
    ApiResponse({
      status: 500,
      description: 'Внутренняя ошибка сервера',
    }),
  );
}
