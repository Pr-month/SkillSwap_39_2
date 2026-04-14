import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../users/users.enums';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    } as any;

    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: UserRole): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: userRole },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('Должен быть определен (defined)', () => {
    expect(guard).toBeDefined();
  });

  it('Должен вернуть true, если роли не указаны (публичный эндпоинт)', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(null);

    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('Должен вернуть true, если у пользователя есть необходимая роль', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([UserRole.ADMIN]);

    const context = createMockContext(UserRole.ADMIN);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('Должен выбросить ForbiddenException, если у пользователя нет необходимой роли', () => {
    jest.spyOn(reflector, 'get').mockReturnValue([UserRole.ADMIN]);

    const context = createMockContext(UserRole.USER);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Доступ запрещен');
  });
});
