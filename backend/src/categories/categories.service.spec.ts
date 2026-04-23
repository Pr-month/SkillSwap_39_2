import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';
import { IsNull, QueryFailedError } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all root categories with children', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Category 1',
          parent: null,
          children: [],
        },
        {
          id: '2',
          name: 'Category 2',
          parent: null,
          children: [],
        },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { parent: IsNull() },
        relations: ['children'],
      });
    });
  });

  describe('checkParentId', () => {
    it('should not throw error if parent exists', async () => {
      const parentId = '1';
      const mockParent = { id: '1', name: 'Parent Category' };

      mockCategoryRepository.findOne.mockResolvedValue(mockParent);

      await expect(service.checkParentId(parentId)).resolves.not.toThrow();
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: parentId },
      });
    });

    it('should throw NotFoundException if parent does not exist', async () => {
      const parentId = 'non-existent';

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.checkParentId(parentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.checkParentId(parentId)).rejects.toThrow(
        'Parent category not found',
      );
    });
  });

  describe('createCategory', () => {
    it('should create a category without parent', async () => {
      const dto: CreateCategoryDto = {
        name: 'New Category',
      };

      const mockCategory = {
        id: '1',
        name: 'New Category',
        parent: null,
        parentId: null,
      };

      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.createCategory(dto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        parent: null,
        parentId: null,
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(mockCategory);
    });

    it('should create a category with parent', async () => {
      const dto: CreateCategoryDto = {
        name: 'Child Category',
        parentId: '1',
      };

      const mockParent = { id: '1', name: 'Parent Category' };
      const mockCategory = {
        id: '2',
        name: 'Child Category',
        parent: { id: '1' },
        parentId: '1',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockParent);
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.createCategory(dto);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.parentId },
      });
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        parent: { id: dto.parentId },
        parentId: dto.parentId,
      });
    });

    it('should throw NotFoundException if parent does not exist', async () => {
      const dto: CreateCategoryDto = {
        name: 'Child Category',
        parentId: 'non-existent',
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.createCategory(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createCategory(dto)).rejects.toThrow(
        'Parent category not found',
      );
    });

    it('should throw ConflictException if category already exists', async () => {
      const dto: CreateCategoryDto = {
        name: 'Existing Category',
      };

      const mockCategory = {
        id: '1',
        name: 'Existing Category',
        parent: null,
        parentId: null,
      };

      mockCategoryRepository.create.mockReturnValue(mockCategory);

      const error = new QueryFailedError(
        'query',
        [],
        new Error(),
      ) as QueryFailedError & { code?: string };
      error.code = '23505';
      mockCategoryRepository.save.mockRejectedValue(error);

      await expect(service.createCategory(dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createCategory(dto)).rejects.toThrow(
        'The category already exists',
      );
    });

    it('should throw BadRequestException for other database errors', async () => {
      const dto: CreateCategoryDto = {
        name: 'New Category',
      };

      const mockCategory = {
        id: '1',
        name: 'New Category',
        parent: null,
        parentId: null,
      };

      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.createCategory(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createCategory(dto)).rejects.toThrow(
        "Couldn't create category",
      );
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const categoryId = '1';
      const dto: UpdateCategoryDto = {
        name: 'Updated Category',
      };

      const mockCategory = {
        id: '1',
        name: 'Old Name',
        parent: null,
        parentId: null,
      };

      const updatedCategory = {
        id: '1',
        name: 'Updated Category',
        parent: null,
        parentId: null,
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(categoryId, dto);

      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: ['parent'],
      });
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should update category with new parent', async () => {
      const categoryId = '2';
      const dto: UpdateCategoryDto = {
        name: 'Updated Category',
        parentId: '1',
      };

      const mockParent = { id: '1', name: 'Parent Category' };
      const mockCategory = {
        id: '2',
        name: 'Old Name',
        parent: null,
        parentId: null,
      };

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(mockParent);

      const updatedCategory = {
        ...mockCategory,
        name: 'Updated Category',
        parent: { id: '1' },
        parentId: '1',
      };

      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(categoryId, dto);

      expect(result.parentId).toEqual('1');
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 'non-existent';
      const dto: UpdateCategoryDto = {
        name: 'Updated Category',
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.updateCategory(categoryId, dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.updateCategory(categoryId, dto)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should throw NotFoundException if parent category does not exist', async () => {
      const categoryId = '1';
      const dto: UpdateCategoryDto = {
        name: 'Updated Category',
        parentId: 'non-existent',
      };

      const mockCategory = {
        id: '1',
        name: 'Old Name',
        parent: null,
        parentId: null,
      };

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null);

      const resultPromise = service.updateCategory(categoryId, dto);
      await expect(resultPromise).rejects.toThrow(NotFoundException);
      await expect(resultPromise).rejects.toThrow('Parent category not found');
    });

    it('should throw ConflictException if parentId is the same as categoryId', async () => {
      const categoryId = '1';
      const dto: UpdateCategoryDto = {
        name: 'Updated Category',
        parentId: '1',
      };

      const mockCategory = {
        id: '1',
        name: 'Old Name',
        parent: null,
        parentId: null,
      };

      const mockParent = { id: '1', name: 'Category' };

      mockCategoryRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(mockParent);

      const resultPromise = service.updateCategory(categoryId, dto);
      await expect(resultPromise).rejects.toThrow(ConflictException);
      await expect(resultPromise).rejects.toThrow(
        'Parent category is the same as child category',
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const categoryId = '1';
      const userId = 'user-1';

      const mockCategory = {
        id: '1',
        name: 'Category to Delete',
      };

      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCategoryRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteCategory(categoryId, userId);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const categoryId = 'non-existent';
      const userId = 'user-1';

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const categoryId = '1';
      const userId = 'non-existent';

      const mockCategory = {
        id: '1',
        name: 'Category to Delete',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteCategory(categoryId, userId)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
