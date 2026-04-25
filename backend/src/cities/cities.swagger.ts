import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CityDto } from './dto/city.dto';

export const ApiFindAllCities = () => {
  return applyDecorators(
    ApiTags('Cities'),
    ApiOperation({
      summary: 'Получить список всех городов',
      description: 'Возвращает массив всех городов с id и названием',
    }),
    ApiOkResponse({
      description: 'Список городов успешно получен',
      type: [CityDto],
    }),
  );
};

export const ApiSearchCities = () => {
  return applyDecorators(
    ApiTags('Cities'),
    ApiOperation({
      summary: 'Поиск городов',
      description:
        'Поиск городов по названию с возможностью ограничения количества результатов',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: 'string',
      description: 'Поисковый запрос для фильтрации городов по названию',
      example: 'Моск',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: 'number',
      description: 'Максимальное количество возвращаемых городов',
      example: 10,
      minimum: 1,
    }),
    ApiOkResponse({
      description: 'Результаты поиска успешно получены',
      type: [CityDto],
    }),
    ApiBadRequestResponse({
      description: 'Неверные параметры запроса',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  );
};
