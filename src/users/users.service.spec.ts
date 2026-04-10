import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { appConfig } from '../config/app.config';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<User>>;

  const appConfigMock = {
    hashSalt: 10,
  };

  beforeEach(async () => {
    usersRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: appConfig.KEY,
          useValue: appConfigMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('hashes password, creates entity and saves user', async () => {
      const email = 'a@b.com';
      const password = 'plain';
      const hashed = 'hashed-pass';

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashed as never);

      const created = { email, password: hashed } as any;
      const saved = { id: 'u1', email, password: hashed } as any;

      usersRepository.create.mockReturnValue(created);
      usersRepository.save.mockResolvedValue(saved);

      await expect(service.createUser(email, password)).resolves.toEqual(saved);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, appConfigMock.hashSalt);
      expect(usersRepository.create).toHaveBeenCalledWith({
        email,
        password: hashed,
      });
      expect(usersRepository.save).toHaveBeenCalledWith(created);
    });
  });

  describe('findByEmail', () => {
    it('calls findOne with where email', async () => {
      const user = { id: 'u1', email: 'a@b.com' } as any;
      usersRepository.findOne.mockResolvedValue(user);

      await expect(service.findByEmail('a@b.com')).resolves.toEqual(user);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
    });
  });

  describe('findById', () => {
    it('calls findOne with where id', async () => {
      const user = { id: 'u1', email: 'a@b.com' } as any;
      usersRepository.findOne.mockResolvedValue(user);

      await expect(service.findById('u1')).resolves.toEqual(user);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'u1' },
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('hashes refresh token and updates user', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-rt' as never);
      usersRepository.update.mockResolvedValue({} as any);

      await expect(service.updateRefreshToken('u1', 'rt')).resolves.toBeUndefined();

      expect(bcrypt.hash).toHaveBeenCalledWith('rt', appConfigMock.hashSalt);
      expect(usersRepository.update).toHaveBeenCalledWith('u1', {
        refreshToken: 'hashed-rt',
      });
    });
  });

  describe('removeRefreshToken', () => {
    it('sets refreshToken to null', async () => {
      usersRepository.update.mockResolvedValue({} as any);

      await expect(service.removeRefreshToken('u1')).resolves.toBeUndefined();
      expect(usersRepository.update).toHaveBeenCalledWith('u1', { refreshToken: null });
    });
  });

  describe('updateUser', () => {
    it('throws 404 if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser('u404', { email: 'x@x.com' } as any))
        .rejects.toBeInstanceOf(NotFoundException);
    });

    it('assigns dto and saves user', async () => {
      const user = { id: 'u1', email: 'old@a.com' } as any;
      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.save.mockImplementation(async (u) => u as any);

      await expect(service.updateUser('u1', { email: 'new@a.com' } as any))
        .resolves.toMatchObject({ id: 'u1', email: 'new@a.com' });

      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'u1', email: 'new@a.com' }),
      );
    });
  });

  describe('updatePassword', () => {
    it('throws 401 if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePassword(
          { sub: 'u1', email: 'a@b.com' } as any,
          { email: 'a@b.com', password: 'new' } as any,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws 401 if payload email mismatch', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 'u1', email: 'user@a.com' } as any);

      await expect(
        service.updatePassword(
          { sub: 'u1', email: 'other@a.com' } as any,
          { email: 'user@a.com', password: 'new' } as any,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws 401 if dto email mismatch', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 'u1', email: 'user@a.com' } as any);

      await expect(
        service.updatePassword(
          { sub: 'u1', email: 'user@a.com' } as any,
          { email: 'other@a.com', password: 'new' } as any,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('hashes new password and updates repository', async () => {
      const user = { id: 'u1', email: 'user@a.com' } as any;
      usersRepository.findOne.mockResolvedValue(user);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-new' as never);
      usersRepository.update.mockResolvedValue({} as any);

      await expect(
        service.updatePassword(
          { sub: 'u1', email: 'user@a.com' } as any,
          { email: 'user@a.com', password: 'newPass' } as any,
        ),
      ).resolves.toEqual(user);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPass', appConfigMock.hashSalt);
      expect(usersRepository.update).toHaveBeenCalledWith('u1', { password: 'hashed-new' });
    });
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      const rows = [{ id: 'u1' }, { id: 'u2' }] as any;
      usersRepository.find.mockResolvedValue(rows);

      await expect(service.findAll()).resolves.toEqual(rows);
      expect(usersRepository.find).toHaveBeenCalled();
    });
  });
});