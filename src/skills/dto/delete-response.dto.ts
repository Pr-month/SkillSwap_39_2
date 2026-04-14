import { ApiProperty } from "@nestjs/swagger";

export class DeleteResponseDto {
  @ApiProperty({
    description: 'Сообщение о результате операции',
    example: 'Skill deleted successfully',
  })
  message: string;
}