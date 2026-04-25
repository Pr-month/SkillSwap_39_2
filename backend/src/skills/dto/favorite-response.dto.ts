import { ApiProperty } from '@nestjs/swagger';

export class FavoriteResponseDto {
  @ApiProperty({
    description: 'Сообщение о результате операции',
    example: 'Skill added to favorites',
  })
  message: string;
}
