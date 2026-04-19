import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP статус код' })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request', description: 'Текст ошибки' })
  error?: string;

  @ApiProperty({
    example: 'Validation failed',
    description: 'Сообщение об ошибке (может быть строкой или массивом)',
  })
  message: string | string[];

  @ApiProperty({
    example: '2026-04-12T17:03:13.250Z',
    description: 'Время ошибки',
  })
  timestamp: string;

  @ApiProperty({ example: '/api/users/me', description: 'Путь запроса' })
  path: string;
}
