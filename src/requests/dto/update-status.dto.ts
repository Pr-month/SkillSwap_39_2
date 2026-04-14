import { IsEnum } from 'class-validator';
import { RequestStatus } from '../requests.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRequestStatusDto {
  @ApiProperty({
    description: 'Новый статус: "accepted" или "rejected"',
    example: 'a3f1c8e2-1234-4b56-9abc-1234567890ab',
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
