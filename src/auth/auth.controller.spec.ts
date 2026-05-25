import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockAuthService = {
    loginService: jest.fn(),
    registerService: jest.fn(),
    profile: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('should set httpOnly cookie and return success message', async () => {
      mockAuthService.loginService.mockResolvedValue({
        acces_token: 'token123',
      });
      const res = mockResponse();

      const result = await controller.login(
        { email: 'test@test.com', password: '123' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token123',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        }),
      );
      expect(result).toEqual({ message: 'Login exitoso' });
    });
  });

  describe('POST /register', () => {
    it('should set httpOnly cookie and return success message', async () => {
      mockAuthService.registerService.mockResolvedValue({
        acces_token: 'token123',
      });
      const res = mockResponse();

      const result = await controller.register(
        { email: 'test@test.com', password: '123' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'token123',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        }),
      );
      expect(result).toEqual({ message: 'Usuario registrado y autenticado' });
    });
  });

  describe('GET /profile', () => {
    it('should return user profile from request', async () => {
      mockAuthService.profile.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      });
      const req = { user: { id: 1, email: 'test@test.com' } };

      const result = await controller.getProfile(req);

      expect(result).toEqual({ id: 1, email: 'test@test.com' });
    });
  });

  describe('POST /logout', () => {
    it('should clear cookie and return success message', () => {
      const res = mockResponse();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ message: 'Sesión cerrada' });
    });
  });
});
