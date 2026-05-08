import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/users.enums';
import { Roles } from '../../decorators/roles.decorator';
import { RequestWithUser } from '../../auth/types/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>(Roles, context.getHandler());

    if (!roles) {
      return true;
    }

    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;

    if (!roles.includes(user.role))
      throw new ForbiddenException('Доступ запрещен');

    return true;
  }
}
