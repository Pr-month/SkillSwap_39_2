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

const ErrorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    message: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        statusCode: { type: 'number' },
      },
    },
    timestamp: { type: 'string', format: 'date-time' },
    path: { type: 'string' },
  },
};

const CategorySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
};

// Схема для сущности User
const UserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    about: { type: 'string', nullable: true },
    birthdate: { type: 'string', format: 'date', nullable: true },
    city: { type: 'string', nullable: true },
    gender: {
      type: 'string',
      enum: ['male', 'female', 'other'],
      nullable: true,
    },
    avatar: { type: 'string', nullable: true },
    role: {
      type: 'string',
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
};

// Схема для сущности Skill
const SkillSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    images: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    name: { type: 'string' }, // исправлено: добавлен объект с type
    userId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    category: CategorySchema,
  },
};

// Основная схема для Request
const RequestSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    sender: UserSchema,
    senderId: { type: 'string' },
    receiver: UserSchema,
    receiverId: { type: 'string' },
    status: {
      type: 'string',
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    offeredSkill: SkillSchema,
    requestedSkill: SkillSchema,
    isRead: { type: 'boolean', default: false },
  },
};

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
      schema: {
        type: 'array',
        items: RequestSchema,
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
      schema: ErrorResponseSchema,
    }),
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
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          senderId: { type: 'string' },
          receiverId: { type: 'string' },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
          },
          offeredSkill: SkillSchema,
          requestedSkill: SkillSchema,
          isRead: { type: 'boolean', default: false },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Неверные данные: отправка самому себе или предлагаемый навык не принадлежит отправителю',
      schema: ErrorResponseSchema,
    }),
    ApiResponse({
      status: 404,
      description:
        'Навык с указанным ID не найден (requestedSkillId или offeredSkillId)',
      schema: ErrorResponseSchema,
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
      schema: ErrorResponseSchema,
    }),
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
    ApiResponse({
      status: 403,
      description: 'Нет прав для удаления (не отправитель и не администратор)',
      schema: ErrorResponseSchema,
    }),
    ApiResponse({
      status: 404,
      description: 'Заявка не найдена',
      schema: ErrorResponseSchema,
    }),
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
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: {
            type: 'string',
            enum: ['pending', 'accepted', 'rejected'],
          },
          createdAt: { type: 'string', format: 'date-time' },
          senderId: { type: 'string' },
          receiverId: { type: 'string' },
          isRead: { type: 'boolean', default: false },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Недопустимый статус (только "accepted"/"rejected")',
      schema: ErrorResponseSchema,
    }),
    ApiResponse({
      status: 403,
      description:
        'Нет прав для обновления (не получатель и не администратор) или статус нельзя изменить',
      schema: ErrorResponseSchema,
    }),
    ApiResponse({
      status: 404,
      description: 'Заявка не найдена',
      schema: ErrorResponseSchema,
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
      schema: ErrorResponseSchema,
    }),
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
      schema: {
        type: 'array',
        items: RequestSchema,
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Не авторизован',
      schema: ErrorResponseSchema,
    }),
  );
};
