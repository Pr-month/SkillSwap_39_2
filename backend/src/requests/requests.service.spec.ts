import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService } from './requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { Skill } from '../skills/entities/skill.entity';
import type { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RequestStatus } from './requests.enum';
import { UserRole } from '../users/users.enums';
import { NotificationsGateway } from '../notification/notification.gateway';

describe('RequestsService', () => {
  let service: RequestsService;
  let requestsRepository: jest.Mocked<Repository<Request>>;
  let skillsRepository: jest.Mocked<Repository<Skill>>;

  beforeEach(async () => {
    requestsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    skillsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

    const notificationsGatewayMock = { sendToUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: requestsRepository,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: skillsRepository,
        },
        {
          provide: NotificationsGateway,
          useValue: notificationsGatewayMock,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOutgoingRequests', () => {
    it('returns outgoing requests ordered desc', async () => {
      const userId = 'u1';
      const rows = [{ id: 'r1' }, { id: 'r2' }] as Request[];
      requestsRepository.find.mockResolvedValue(rows);

      const expectRows = rows.map((request) => service.toRequestDto(request));
      await expect(service.getOutgoingRequests(userId)).resolves.toEqual(
        expectRows,
      );
      expect(requestsRepository.find).toHaveBeenCalledWith({
        where: { sender: { id: userId } },
        relations: ['receiver', 'offeredSkill', 'requestedSkill'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getIncomingRequests', () => {
    it('returns incoming requests ordered desc', async () => {
      const userId = 'u1';
      const rows = [{ id: 'r1' }] as Request[];
      requestsRepository.find.mockResolvedValue(rows);

      const expectRows = rows.map((request) => service.toRequestDto(request));
      await expect(service.getIncomingRequests(userId)).resolves.toEqual(
        expectRows,
      );
      expect(requestsRepository.find).toHaveBeenCalledWith({
        where: { receiver: { id: userId } },
        relations: ['sender', 'offeredSkill', 'requestedSkill'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('createRequests', () => {
    it('throws 404 if requestedSkill not found', async () => {
      const userId = 'u1';
      skillsRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.createRequests(userId, {
          requestedSkillId: 's_req',
          offeredSkillId: 's_off',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 400 if trying to request own skill', async () => {
      const userId = 'u1';
      skillsRepository.findOne.mockResolvedValueOnce({
        id: 's_req',
        owner: { id: userId },
      } as any);

      await expect(
        service.createRequests(userId, {
          requestedSkillId: 's_req',
          offeredSkillId: 's_off',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws 404 if offeredSkill not found', async () => {
      const userId = 'u1';
      skillsRepository.findOne
        .mockResolvedValueOnce({
          id: 's_req',
          owner: { id: 'u2' },
        } as any)
        .mockResolvedValueOnce(null);

      await expect(
        service.createRequests(userId, {
          requestedSkillId: 's_req',
          offeredSkillId: 's_off',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 400 if offeredSkill does not belong to sender', async () => {
      const userId = 'u1';
      skillsRepository.findOne
        .mockResolvedValueOnce({
          id: 's_req',
          owner: { id: 'u2' },
        } as any)
        .mockResolvedValueOnce({
          id: 's_off',
          owner: { id: 'u3' },
        } as any);

      await expect(
        service.createRequests(userId, {
          requestedSkillId: 's_req',
          offeredSkillId: 's_off',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates and saves request', async () => {
      const userId = 'u1';
      const requestedSkill = { id: 's_req', owner: { id: 'u2' } } as any;
      const offeredSkill = { id: 's_off', owner: { id: userId } } as any;
      const created = { id: 'r1' } as any;
      skillsRepository.findOne
        .mockResolvedValueOnce(requestedSkill)
        .mockResolvedValueOnce(offeredSkill);
      requestsRepository.create.mockReturnValue(created);
      requestsRepository.save.mockResolvedValue(created);

      const expectCreated = service.toRequestDto(created);
      await expect(
        service.createRequests(userId, {
          requestedSkillId: 's_req',
          offeredSkillId: 's_off',
        }),
      ).resolves.toEqual(expectCreated);

      expect(requestsRepository.create).toHaveBeenCalledWith({
        senderId: userId,
        receiverId: 'u2',
        offeredSkill,
        requestedSkill,
      });
      expect(requestsRepository.save).toHaveBeenCalledWith(created);
    });
  });

  describe('updateStatus', () => {
    it('throws 403 if status is not accepted/rejected', async () => {
      await expect(
        service.updateStatus(
          'r1',
          { sub: 'u1', email: 'a@b.com', role: UserRole.USER } as any,
          { status: RequestStatus.PENDING } as any,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws 404 if request not found', async () => {
      requestsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          'r1',
          { sub: 'u1', email: 'a@b.com', role: UserRole.USER } as any,
          { status: RequestStatus.ACCEPTED },
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 403 if not admin and not receiver', async () => {
      requestsRepository.findOne.mockResolvedValue({
        id: 'r1',
        receiverId: 'u2',
        status: RequestStatus.PENDING,
      } as any);

      await expect(
        service.updateStatus(
          'r1',
          { sub: 'u1', email: 'a@b.com', role: UserRole.USER } as any,
          { status: RequestStatus.ACCEPTED },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('updates status when receiver', async () => {
      const req = {
        id: 'r1',
        receiverId: 'u1',
        status: RequestStatus.PENDING,
      } as any;
      requestsRepository.findOne.mockResolvedValue(req);
      requestsRepository.save.mockResolvedValue({
        ...req,
        status: RequestStatus.ACCEPTED,
      });

      await expect(
        service.updateStatus(
          'r1',
          { sub: 'u1', email: 'a@b.com', role: UserRole.USER } as any,
          { status: RequestStatus.ACCEPTED },
        ),
      ).resolves.toMatchObject({ status: RequestStatus.ACCEPTED });
      expect(requestsRepository.save).toHaveBeenCalled();
    });

    it('updates status when admin', async () => {
      const req = {
        id: 'r1',
        receiverId: 'u2',
        status: RequestStatus.PENDING,
      } as any;
      requestsRepository.findOne.mockResolvedValue(req);
      requestsRepository.save.mockResolvedValue({
        ...req,
        status: RequestStatus.REJECTED,
      });

      await expect(
        service.updateStatus(
          'r1',
          { sub: 'admin', email: 'a@b.com', role: UserRole.ADMIN } as any,
          { status: RequestStatus.REJECTED },
        ),
      ).resolves.toMatchObject({ status: RequestStatus.REJECTED });
    });
  });

  describe('deleteRequest', () => {
    it('throws 404 if request not found', async () => {
      requestsRepository.findOne.mockResolvedValue(null);
      await expect(
        service.deleteRequest('r1', {
          sub: 'u1',
          email: 'a@b.com',
          role: UserRole.USER,
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 403 if not admin and not sender', async () => {
      requestsRepository.findOne.mockResolvedValue({
        id: 'r1',
        senderId: 'u2',
      } as any);

      await expect(
        service.deleteRequest('r1', {
          sub: 'u1',
          email: 'a@b.com',
          role: UserRole.USER,
        } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('deletes when sender', async () => {
      requestsRepository.findOne.mockResolvedValue({
        id: 'r1',
        senderId: 'u1',
      } as any);
      requestsRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(
        service.deleteRequest('r1', {
          sub: 'u1',
          email: 'a@b.com',
          role: UserRole.USER,
        } as any),
      ).resolves.toBeUndefined();
      expect(requestsRepository.delete).toHaveBeenCalledWith('r1');
    });

    it('deletes when admin', async () => {
      requestsRepository.findOne.mockResolvedValue({
        id: 'r1',
        senderId: 'u2',
      } as any);
      requestsRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(
        service.deleteRequest('r1', {
          sub: 'admin',
          email: 'a@b.com',
          role: UserRole.ADMIN,
        } as any),
      ).resolves.toBeUndefined();
    });
  });
});
