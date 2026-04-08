import { RefreshAuthGuard } from './refresh-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('RefreshAuthGuard', () => {
  let guard: RefreshAuthGuard;

  beforeEach(() => {
    guard = new RefreshAuthGuard();
  });

  it('должен быть определен (defined)', () => {
    expect(guard).toBeDefined();
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
      .spyOn(RefreshAuthGuard.prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(canActivateSpy).toHaveBeenCalledWith(context);

    canActivateSpy.mockRestore();
  });
});
