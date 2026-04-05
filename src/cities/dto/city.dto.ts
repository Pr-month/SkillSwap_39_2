import { IsString, IsUUID } from 'class-validator';

export class CityDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;
}
