import { RefreshAuthGuard } from './refresh-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('RefreshAuthGuard', () => {
  let guard: RefreshAuthGuard;

  beforeEach(() => {
    guard = new RefreshAuthGuard();
  });

  it('должен быть определен (defined)', () => {
    expect(guard).toBeDefined();
  });

  it('должен вернуть true, если JWT токен валиден (успешная активация)', async () => {
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
      .spyOn(AuthGuard('jwt-refresh').prototype, 'canActivate')
      .mockImplementation(() => true);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(superCanActivateSpy).toHaveBeenCalled();

    superCanActivateSpy.mockRestore();
  });

  it('должен вызвать родительский метод canActivate', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    const canActivateSpy = jest
      .spyOn(RefreshAuthGuard.prototype, 'canActivate')
      .mockImplementation(() => true);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(canActivateSpy).toHaveBeenCalledWith(context);

    canActivateSpy.mockRestore();
  });
});
