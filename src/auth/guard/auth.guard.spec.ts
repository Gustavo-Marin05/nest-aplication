import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: any;

  const mockJwt = {
    verifyAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jwtService = mockJwt;
    guard = new AuthGuard(jwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if token is valid', async () => {
    const payload = { id: 1, email: 'test@test.com' };
    mockJwt.verifyAsync.mockResolvedValue(payload);

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: { token: 'validToken' },
        }),
      }),
    };

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockJwt.verifyAsync).toHaveBeenCalledWith('validToken', {
      secret: expect.any(String),
    });
  });

  it('should throw UnauthorizedException if no token cookie', async () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
        }),
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    mockJwt.verifyAsync.mockRejectedValue(new Error('invalid token'));

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: { token: 'badToken' },
        }),
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
