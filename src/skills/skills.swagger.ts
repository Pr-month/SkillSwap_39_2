import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { SkillDto } from './dto/skills.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { DeleteResponseDto } from './dto/delete-response.dto';
import { RemoveFromFavoritesResponseDto } from './dto/remove-from-favorites-response.dto';

export const ApiFindAllSkills = () => {
  return applyDecorators(
    ApiTags('Skills'),
    ApiOperation({
      summary: 'Получить список навыков с пагинацией',
    }),
    ApiOkResponse({
      description: 'Список навыков успешно получен',
      type: PaginationResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Запрошенная страница не существует',
      schema: {
        example: {
          statusCode: 404,
          message: 'Страница 10 не существует. Доступно всего 5 страниц.',
          error: 'Not Found',
        },
      },
    }),
  );
};

export const ApiCreateSkill = () => {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Создать новый навык',
      description:
        'Создает новый навык для авторизованного пользователя. Требуется JWT токен.',
    }),
    ApiCreatedResponse({
      description: 'Навык успешно создан',
      type: SkillDto,
    }),
    ApiBadRequestResponse({
      description: 'Некорректные данные запроса',
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
    }),
  );
};

export const ApiAddFavoriteSkill = () => {
  return applyDecorators(
    ApiTags('Skills'),
    ApiOperation({
      summary: 'Добавить навык в избранное',
      description:
        'Добавляет указанный навык в список избранных текущего пользователя. Требуется JWT токен.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      example: '550e8400-e29b-41d4-a716-446655440001',
      type: 'string',
      format: 'uuid',
    }),
    ApiCreatedResponse({
      description: 'Навык успешно добавлен в избранное',
      type: FavoriteResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Пользователь или навык не найдены',
      schema: {
        oneOf: [
          {
            example: {
              statusCode: 404,
              message: 'User not found',
              error: 'Not Found',
            },
          },
          {
            example: {
              statusCode: 404,
              message: 'Skill not found',
              error: 'Not Found',
            },
          },
        ],
      },
    }),
    ApiConflictResponse({
      description: 'Навык уже находится в избранном',
      schema: {
        example: {
          statusCode: 409,
          message: 'Skill is already in favorites',
          error: 'Conflict',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          timestamp: '2026-04-10T05:47:13.250Z',
          path: '/api/skills/123/favorite',
        },
      },
    }),
  );
};

export const ApiUpdateSkill = () => {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновить навык',
      description: 'Обновляет существующий навык. Только владелец навыка может его обновить. Требуется JWT токен.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      example: '550e8400-e29b-41d4-a716-446655440001',
      type: 'string',
      format: 'uuid',
    }),
    ApiOkResponse({
      description: 'Навык успешно обновлен',
      type: SkillDto,
    }),
    ApiBadRequestResponse({
      description: 'Некорректные данные запроса',
      schema: {
        example: {
          statusCode: 400,
          message: ['name must be longer than or equal to 2 characters'],
          error: 'Bad Request',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Навык не найден',
      schema: {
        example: {
          statusCode: 404,
          message: 'Skill not found',
          error: 'Not Found',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на обновление навыка',
      schema: {
        example: {
          statusCode: 403,
          message: 'You can update only your own skill',
          error: 'Forbidden',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
  );
};


export const ApiDeleteSkill = () => {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить навык',
      description: 'Удаляет существующий навык. Только владелец навыка может его удалить. Требуется JWT токен.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      example: '550e8400-e29b-41d4-a716-446655440001',
      type: 'string',
      format: 'uuid',
    }),
    ApiOkResponse({
      description: 'Навык успешно удален',
      type: DeleteResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Навык не найден',
      schema: {
        example: {
          statusCode: 404,
          message: 'Skill not found',
          error: 'Not Found',
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Нет прав на удаление навыка',
      schema: {
        example: {
          statusCode: 403,
          message: 'You can delete only your own skill',
          error: 'Forbidden',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
  );
};

export const ApiRemoveFavoriteSkill = () => {
  return applyDecorators(
    ApiTags('Skills'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Удалить навык из избранного',
      description: 'Удаляет указанный навык из списка избранных текущего пользователя. Требуется JWT токен.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      example: '550e8400-e29b-41d4-a716-446655440001',
      type: 'string',
      format: 'uuid',
    }),
    ApiOkResponse({
      description: 'Навык успешно удален из избранного',
      type: RemoveFromFavoritesResponseDto,
      schema: {
        example: {
          message: 'Skill removed from favorites',
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Пользователь не найден или навык отсутствует в избранном',
      schema: {
        oneOf: [
          {
            example: {
              statusCode: 404,
              message: 'User not found or has no favorite skills',
              error: 'Not Found',
            },
          },
          {
            example: {
              statusCode: 404,
              message: 'Skill not found in your favorites',
              error: 'Not Found',
            },
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Пользователь не авторизован',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
        },
      },
    }),
  );
};

