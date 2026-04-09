import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiUploadFile = () => {
  return applyDecorators(
    ApiTags('Files'),
    ApiOperation({ summary: 'Загрузить изображение' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Файл изображения любого формата (мин. 1 КБ)',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
        required: ['file'],
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Файл успешно загружен',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 201 },
          message: { type: 'string', example: 'Файл успешно загружен' },
          data: {
            type: 'object',
            properties: {
              fileName: {
                type: 'string',
                example: '/public/uploads/unique-filename.jpg',
              },
              originalName: { type: 'string', example: 'my-photo.jpg' },
              size: { type: 'number', example: 1048576 },
              mimeType: { type: 'string', example: 'image/jpeg' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка при загрузке файла',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'string',
            enum: ['Размер файла слишком мал', 'Ошибка при сохранении файла'],
          },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  );
};
