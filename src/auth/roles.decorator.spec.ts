import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.decorator.js';

describe('RolesGuard', () => {
  const reflector = {
    getAllAndOverride: vi.fn(() => ['ADMIN']),
  } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  function contextForRole(role?: string): ExecutionContext {
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { role } : {} }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows an admin', () => {
    expect(guard.canActivate(contextForRole('ADMIN'))).toBe(true);
  });

  it('denies a member', () => {
    expect(guard.canActivate(contextForRole('MEMBER'))).toBe(false);
  });

  it('denies a request without a role', () => {
    expect(guard.canActivate(contextForRole())).toBe(false);
  });
});
