import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from './dto/error-response.dto';

interface ApiErrorOptions {
  statuses?: number[];
}

export function ApiCommonErrors(options?: ApiErrorOptions) {
  const statuses = options?.statuses || [400, 401, 403, 404];

  const responses = statuses.map((status) => {
    const descriptions: Record<number, string> = {
      400: 'Неверные данные запроса',
      401: 'Не авторизован',
      403: 'Нет прав доступа',
      404: 'Ресурс не найден',
    };

    return ApiResponse({
      status,
      description: descriptions[status] || `Ошибка ${status}`,
      type: ErrorResponseDto,
    });
  });

  return applyDecorators(...responses);
}
