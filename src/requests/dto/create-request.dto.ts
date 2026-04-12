import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({
    description: 'ID навыка, который пользователь предлагает',
    example: 'a3f1c8e2-1234-4b56-9abc-1234567890ab',
  })
  @IsUUID()
  requestedSkillId: string;

  @ApiProperty({
    description: 'ID навыка, который пользователь хочет получить',
    example: 'b7d2e9f4-5678-4cde-8fgh-0987654321cd',
  })
  @IsUUID()
  offeredSkillId: string;
}
