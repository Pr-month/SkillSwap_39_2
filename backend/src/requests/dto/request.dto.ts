import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsDate,
  IsBoolean,
  IsEnum,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { RequestStatus } from '../requests.enum';

export class SkillRequestDto {
  @ApiProperty({
    description: 'Уникальный идентификатор навыка',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Наименование навыка',
    example: 'Игра на барабанах',
  })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({
    description: 'Категория навыка',
    example: 'Ударные',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  category: string;
}

export class UserRequestDto {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  readonly id: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'ivan.ivanov@example.com',
  })
  @IsString()
  readonly email: string;
}

export class RequestDto {
  @ApiProperty({
    description: 'Уникальный идентификатор заявки',
    example: 'a3f1c8e2-1234-4b56-9abc-1234567890ab',
  })
  @IsUUID()
  readonly id: string;

  @ApiProperty({
    description: 'Дата и время создания заявки',
    example: '2023-10-15T14:30:00.000Z',
  })
  @IsDate()
  readonly createdAt: Date;

  @ApiProperty({
    description: 'ID отправителя заявки',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  readonly senderId: string;

  @ApiProperty({
    description: 'Отправитель заявки',
    type: () => UserRequestDto,
  })
  readonly sender: UserRequestDto | null;

  @ApiProperty({
    description: 'ID получателя заявки',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  readonly receiverId: string;

  @ApiProperty({
    description: 'Получатель заявки',
    type: () => UserRequestDto,
  })
  readonly receiver: UserRequestDto | null;

  @ApiProperty({
    description: 'Статус заявки',
    enum: RequestStatus,
    example: RequestStatus.PENDING,
  })
  @IsEnum(RequestStatus)
  readonly status: RequestStatus;

  @ApiProperty({
    description: 'Предлагаемый навык',
    type: SkillRequestDto,
  })
  readonly offeredSkill: SkillRequestDto | null;

  @ApiProperty({
    description: 'Запрашиваемый навык',
    type: SkillRequestDto,
  })
  readonly requestedSkill: SkillRequestDto | null;

  @ApiProperty({
    description: 'Флаг прочтения заявки',
    example: false,
  })
  @IsBoolean()
  readonly isRead: boolean;
}
