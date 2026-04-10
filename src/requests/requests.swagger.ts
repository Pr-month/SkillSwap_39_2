import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-status.dto';
import { ApiCommonErrors } from '../common/apiCommonErrors.swagger';
import { RequestDto } from './dto/request.dto';

export const ApiRequestOutgoing = () => {
  return applyDecorators(
    ApiTags('Requests'),
    ApiOperation({
      summary: 'Получить исходящие заявки',
      description: 'Возвращает список исходящих заявок текущего пользователя',
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Успешный ответ',
      type: RequestDto,
      isArray: true,
    }),
    ApiCommonErrors({ statuses: [401] }),
  );
};

export const ApiRequestCreate = () => {
  return applyDecorators(
    ApiTags('Requests'),
    ApiOperation({
      summary: 'Создать новую заявку',
      description:
        'Создаёт заявку на обмен навыками. Проверяет: существование навыков, запрет отправки самому себе, принадлежность предлагаемого навыка отправителю',
    }),
    ApiBearerAuth(),
    ApiBody({
      type: CreateRequestDto,
      description:
        'Данные для создания заявки: offeredSkillId, requestedSkillId',
    }),
    ApiResponse({
      status: 201,
      description: 'Запрос создан успешно',
      type: RequestDto,
    }),
    ApiCommonErrors({ statuses: [400, 401, 404] }),
  );
};

export const ApiRequestDelete = () => {
  return applyDecorators(
    ApiTags('Requests'),
    ApiOperation({
      summary: 'Удалить заявку',
      description:
        'Удаляет заявку по ID. Может удалить: отправитель или администратор',
    }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'ID заявки',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Заявка удалена успешно',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Request deleted successfully' },
        },
      },
    }),
    ApiCommonErrors({ statuses: [401, 403, 404] }),    
  );
};

export const ApiRequestUpdateStatus = () => {
  return applyDecorators(
    ApiTags('Requests'),
    ApiOperation({
      summary: 'Обновить статус заявки',
      description:
        'Обновляет статус заявки на "accepted" или "rejected". Может обновить: получатель или администратор',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      required: true,
      description: 'ID заявки',
      type: 'string',
    }),
    ApiBody({
      type: UpdateRequestStatusDto,
      description: 'Новый статус: "accepted" или "rejected"',
    }),
    ApiResponse({
      status: 200,
      description: 'Статус обновлён успешно',
      type: RequestDto,
    }),
    ApiCommonErrors({ statuses: [400, 401, 403, 404] }),        
  );
};

export const ApiRequestIncoming = () => {
  return applyDecorators(
    ApiTags('Requests'),
    ApiOperation({
      summary: 'Получить входящие заявки',
      description: 'Возвращает список входящих заявок текущего пользователя',
    }),
    ApiResponse({
      status: 200,
      description: 'Успешный ответ',
      type: RequestDto,
    }),
    ApiCommonErrors({ statuses: [401] }),       
  );
};
