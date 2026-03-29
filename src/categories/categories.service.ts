import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });
  }

  async checkParentId(parentId: string) {
    const parent = await this.categoryRepository.findOne({
      where: {
        id: parentId
      }
    });
    if (!parent) {
      throw new NotFoundException('Parent category not found');
    }
  }

  async createCategory(dto: CreateCategoryDto) {
    if (dto.parentId) {
      await this.checkParentId(dto.parentId);
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      parent: dto.parentId ? { id: dto.parentId } : null,
      parentId: dto.parentId ?? null,
    });

    try {
      return await this.categoryRepository.save(category);
    } catch (err) {
      const error = err as QueryFailedError & { code?: string };
      if (error.code === '23505') {
        throw new ConflictException(`The category already exists`);
      }
      throw new BadRequestException(`Couldn't create category`);
    }
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id : categoryId },
      relations: ['parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.parentId) {
      await this.checkParentId(dto.parentId);
    }

    if (dto.parentId === categoryId) {
      throw new ConflictException('Parent category is the same as child category');
    }

    category.name = dto.name;
    category.parent = dto.parentId ? ({ id: dto.parentId } as Category) : null;
    category.parentId = dto.parentId ?? null;

    return await this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.categoryRepository.delete(categoryId);
  }
}
