import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({ example: 'Unauthorized' })
  message: string;

  @ApiProperty({ example: '2026-04-10T05:47:13.250Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/requests' })
  path: string;
}
