import { IsEnum, IsOptional } from 'class-validator';
import { RequestStatus } from '../requests.enum';

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
