import { Request } from 'express';
import { User } from '../../users/entities/user.entity';

export interface IRequestWithUser extends Request {
  user?: User;
  cookies: { [key: string]: string };
}
