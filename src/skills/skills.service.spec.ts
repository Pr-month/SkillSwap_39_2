import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { User } from '../users/entities/user.entity';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('SkillsService', () => {
  let service: SkillsService;
  let skillsRepository: jest.Mocked<Repository<Skill>>;
  let usersRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    skillsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;

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
        SkillsService,
        {
          provide: getRepositoryToken(Skill),
          useValue: skillsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSkillsWithPagination', () => {
    it('returns data with computed totalPages', async () => {
      skillsRepository.findAndCount.mockResolvedValue([[{ id: 's1' } as any], 11]);

      await expect(service.getSkillsWithPagination({ page: 1, limit: 5 } as any))
        .resolves.toMatchObject({
          page: 1,
          totalPages: 3,
        });

      expect(skillsRepository.findAndCount).toHaveBeenCalledWith({
        take: 5,
        skip: 0,
        order: { id: 'ASC' },
        relations: ['owner'],
      });
    });

    it('throws 404 when page > totalPages', async () => {
      skillsRepository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        service.getSkillsWithPagination({ page: 2, limit: 5 } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves skill with owner id', async () => {
      const dto = { name: 'n', description: 'd', images: [] } as any;
      const created = { id: 's1' } as any;
      skillsRepository.create.mockReturnValue(created);
      skillsRepository.save.mockResolvedValue(created);

      await expect(service.create(dto, 'u1')).resolves.toEqual(created);
      expect(skillsRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        description: dto.description,
        images: dto.images,
        owner: { id: 'u1' },
      });
      expect(skillsRepository.save).toHaveBeenCalledWith(created);
    });
  });

  describe('findAll', () => {
    it('returns skills ordered by name', async () => {
      const rows = [{ id: 's1' }] as any;
      skillsRepository.find.mockResolvedValue(rows);

      await expect(service.findAll()).resolves.toEqual(rows);
      expect(skillsRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
    });
  });

  describe('update', () => {
    it('throws 404 if skill not found', async () => {
      skillsRepository.findOne.mockResolvedValue(null);
      await expect(service.update('s1', 'u1', { name: 'x' } as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws 403 if trying to update чужой skill', async () => {
      skillsRepository.findOne.mockResolvedValue({ id: 's1', userId: 'u2' } as any);
      await expect(service.update('s1', 'u1', { name: 'x' } as any)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('saves updated skill when owner matches', async () => {
      const skill = { id: 's1', userId: 'u1', name: 'old' } as any;
      skillsRepository.findOne.mockResolvedValue(skill);
      skillsRepository.save.mockResolvedValue({ ...skill, name: 'new' });

      await expect(service.update('s1', 'u1', { name: 'new' } as any)).resolves.toMatchObject({
        name: 'new',
      });
    });
  });

  describe('deleteSkill', () => {
    it('throws 404 if not found', async () => {
      skillsRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteSkill('s1', 'u1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 403 if not owner', async () => {
      skillsRepository.findOne.mockResolvedValue({ id: 's1', userId: 'u2' } as any);
      await expect(service.deleteSkill('s1', 'u1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('deletes when owner', async () => {
      skillsRepository.findOne.mockResolvedValue({ id: 's1', userId: 'u1' } as any);
      skillsRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(service.deleteSkill('s1', 'u1')).resolves.toBeUndefined();
      expect(skillsRepository.delete).toHaveBeenCalledWith('s1');
    });
  });

  describe('addFavoriteSkill', () => {
    it('throws 404 if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(service.addFavoriteSkill('u1', 's1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 404 if skill not found', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 'u1', favoriteSkills: [] } as any);
      skillsRepository.findOne.mockResolvedValue(null);
      await expect(service.addFavoriteSkill('u1', 's1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws 409 if already in favorites', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'u1',
        favoriteSkills: [{ id: 's1' }],
      } as any);
      skillsRepository.findOne.mockResolvedValue({ id: 's1' } as any);

      await expect(service.addFavoriteSkill('u1', 's1')).rejects.toBeInstanceOf(ConflictException);
    });

    it('adds to favorites and saves user', async () => {
      const user = { id: 'u1', favoriteSkills: [] as any[] } as any;
      const skill = { id: 's1' } as any;
      usersRepository.findOne.mockResolvedValue(user);
      skillsRepository.findOne.mockResolvedValue(skill);
      usersRepository.save.mockResolvedValue(user);

      await expect(service.addFavoriteSkill('u1', 's1')).resolves.toBeUndefined();
      expect(user.favoriteSkills).toEqual([skill]);
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('removeFavoriteSkill', () => {
    it('throws 404 if user not found or no favorites', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(service.removeFavoriteSkill('u1', 's1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws 404 if skill not in favorites', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 'u1',
        favoriteSkills: [{ id: 's2' }],
      } as any);

      await expect(service.removeFavoriteSkill('u1', 's1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('removes skill from favorites and saves user', async () => {
      const user = {
        id: 'u1',
        favoriteSkills: [{ id: 's1' }, { id: 's2' }],
      } as any;
      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(user);

      await expect(service.removeFavoriteSkill('u1', 's1')).resolves.toBeUndefined();
      expect(user.favoriteSkills).toEqual([{ id: 's2' }]);
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });
  });
});
