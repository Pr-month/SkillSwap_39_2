import { Request } from 'express';
import type { AccessTokenPayload } from '../auth.types';

export interface RequestWithUser extends Request {
  user: AccessTokenPayload;
}
