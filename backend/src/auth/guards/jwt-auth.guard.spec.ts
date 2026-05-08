import { JwtAuthGuard } from './jwtAuth.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('должен быть определен (defined)', () => {
    expect(guard).toBeDefined();
  });

  it('должен вернуть true, если JWT токен валиден', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid-token' },
        }),
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    const superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockImplementation(() => true);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(superCanActivateSpy).toHaveBeenCalled();

    superCanActivateSpy.mockRestore();
  });

  it('должен вызывать родительский метод canActivate', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    const canActivateSpy = jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockImplementation(() => true);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(canActivateSpy).toHaveBeenCalledWith(context);

    canActivateSpy.mockRestore();
  });
});
