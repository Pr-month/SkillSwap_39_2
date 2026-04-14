import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export class SimilarSkillsResponseDto {
  @ApiProperty({
    description: 'Список пользователей с похожими навыками',
  })
  users: User[];

  @ApiProperty({
    description: 'Количество найденных пользователей',
    example: 1,
    minimum: 0,
  })
  count: number;
}