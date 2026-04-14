import { ApiProperty } from '@nestjs/swagger';

export class RemoveFromFavoritesResponseDto {
  @ApiProperty({
    description: 'Сообщение о результате операции',
    example: 'Skill removed from favorites',
  })
  message: string;
}
