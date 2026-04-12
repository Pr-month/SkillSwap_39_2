import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiParam,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';

export function ApiCategoriesTag() {
  return applyDecorators(ApiTags('Categories'));
}

export function ApiCategoriesGet() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список корневых категорий с дочерними' }),
    ApiOkResponse({
      description:
        'Список корневых категорий. У каждой может быть массив children.',
      type: CategoryResponseDto,
      isArray: true,
    }),
  );
}

export function ApiCategoriesPost() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Создать категорию (ADMIN)' }),
    ApiCreatedResponse({
      description: 'Категория создана',
      type: CategoryResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Parent category not found',
      type: ErrorResponseDto,
    }),
    ApiConflictResponse({
      description: 'The category already exists',
      type: ErrorResponseDto,
    }),
    ApiBadRequestResponse({
      description: "Couldn't create category",
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Не авторизован',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Нет прав (не ADMIN)',
      type: ErrorResponseDto,
    }),
  );
}

export function ApiCategoriesPatch() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Обновить категорию (ADMIN)' }),
    ApiParam({ name: 'id', description: 'ID категории', example: 'uuid' }),
    ApiOkResponse({
      description: 'Категория обновлена',
      type: CategoryResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Category not found / Parent category not found',
      type: ErrorResponseDto,
    }),
    ApiConflictResponse({
      description: 'Parent category is the same as child category',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Не авторизован',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Нет прав (не ADMIN)',
      type: ErrorResponseDto,
    }),
  );
}

export function ApiCategoriesDelete() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Удалить категорию (ADMIN)' }),
    ApiParam({ name: 'id', description: 'ID категории', example: 'uuid' }),
    ApiOkResponse({
      description: 'Категория удалена',
      schema: { example: { message: 'Category deleted successfully' } },
    }),
    ApiNotFoundResponse({
      description: 'Category not found / User not found',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Не авторизован',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Нет прав (не ADMIN)',
      type: ErrorResponseDto,
    }),
  );
}
