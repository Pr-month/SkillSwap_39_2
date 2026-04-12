import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SimilarSkillsResponseDto } from './dto/similar-skills-response.dto';

export const ApiFindSimilarSkills = () => {
  return applyDecorators(
    ApiTags('Skills'),
    ApiOperation({
      summary: 'Найти похожие навыки',
      description:
        'Возвращает список пользователей, у которых есть навыки из той же категории, что и указанный навык. Исключает владельца исходного навыка.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID навыка',
      example: '550e8400-e29b-41d4-a716-446655440001',
      type: 'string',
      format: 'uuid',
    }),
    ApiOkResponse({
      description: 'Список пользователей успешно получен',
      type: [SimilarSkillsResponseDto],
    }),
    ApiNotFoundResponse({
      description: 'Навык не найден или у навыка нет категории',
      schema: {
        oneOf: [
          {
            example: {
              statusCode: 404,
              message: 'Навык не найден',
              error: 'Not Found',
            },
          },
          {
            example: {
              statusCode: 404,
              message: 'У навыка нет категории',
              error: 'Not Found',
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректные параметры запроса',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'limit must not be greater than 50',
            'limit must not be less than 1',
          ],
          error: 'Bad Request',
        },
      },
    }),
  );
};
