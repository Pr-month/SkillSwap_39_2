import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { jwtConfig } from '../config/jwt.config';
import * as bcrypt from 'bcrypt';
import { Gender, UserRole } from '../users/users.enums';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Мок для пользователей
  const mockUser = {
    id: 'uuid-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn().mockResolvedValue(mockUser),
            findByEmail: jest.fn(),
            updateRefreshToken: jest.fn().mockResolvedValue(undefined),
            removeRefreshToken: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mockToken'),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            access_token_key: 'access-secret',
            access_token_expiry: '15m',
            refresh_token_key: 'refresh-secret',
            refresh_token_expiry: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('должен успешно зарегистрировать пользователя и вернуть токены', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        gender: Gender.OTHER,
        cityId: 'city-1',
        about: 'About',
        birthdate: '2000-01-01',
      };

      const result = await service.registerUser(dto);

      expect(usersService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toEqual('test@example.com');
    });
  });

  describe('login', () => {
    it('должен выбросить UnauthorizedException, если пользователь не найден', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login('wrong@email.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('должен выбросить UnauthorizedException, если пароль неверный', async () => {
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('должен вернуть токены при успешном входе', async () => {
      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login('test@example.com', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('должен вызвать удаление токена в UsersService', async () => {
      await service.logout('uuid-123');
      expect(usersService.removeRefreshToken).toHaveBeenCalledWith('uuid-123');
    });
  });
});
