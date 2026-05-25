jest.mock('./libs/bcryp', () => ({
  encrypt: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { encrypt, compare } from './libs/bcryp';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginService', () => {
    it('should return access token on valid credentials', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hash' };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      (compare as jest.Mock).mockResolvedValue(true);
      mockJwt.signAsync.mockResolvedValue('token123');

      const result = await service.loginService('test@test.com', 'password123');

      expect(result).toEqual({ acces_token: 'token123' });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(compare).toHaveBeenCalledWith('password123', 'hash');
    });

    it('should throw BadRequestException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.loginService('test@test.com', 'password123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hash',
      });
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.loginService('test@test.com', 'wrong'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerService', () => {
    it('should register a new user and return token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
      });
      mockJwt.signAsync.mockResolvedValue('token123');

      const result = await service.registerService({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({ acces_token: 'token123' });
      expect(encrypt).toHaveBeenCalledWith('password123');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: 'test@test.com', password: 'hashedPassword' },
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hash',
      });

      await expect(
        service.registerService({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('profile', () => {
    it('should return user id and email', async () => {
      const result = await service.profile({
        id: 1,
        email: 'test@test.com',
      });

      expect(result).toEqual({ id: 1, email: 'test@test.com' });
    });

    it('should throw UnauthorizedException if user is null', async () => {
      await expect(service.profile(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
