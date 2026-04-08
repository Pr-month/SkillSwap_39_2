import {
  Controller,
  Delete,
  UseGuards,
  Param,
  Req,
  Post,
  Body,
  Get,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/users.enums';
import { RequestWithUser } from '../auth/types/request-with-user.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ErrorResponseDto } from '../common/swagger/error-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiParam,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список корневых категорий с дочерними' })
  @ApiOkResponse({
    description:
      'Список корневых категорий. У каждой может быть массив children.',
    type: CategoryResponseDto,
    isArray: true,
  })
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать категорию (ADMIN)' })
  @ApiCreatedResponse({
    description: 'Категория создана',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Parent category not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'The category already exists',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Couldn't create category",
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Нет прав (не ADMIN)',
    type: ErrorResponseDto,
  })
  async createCategory(
    @Req() _req: RequestWithUser,
    @Body() category: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(category);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить категорию (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID категории', example: 'uuid' })
  @ApiOkResponse({
    description: 'Категория обновлена',
    type: CategoryResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found / Parent category not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Parent category is the same as child category',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Нет прав (не ADMIN)',
    type: ErrorResponseDto,
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(id, category);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить категорию (ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID категории', example: 'uuid' })
  @ApiOkResponse({
    description: 'Категория удалена',
    schema: { example: { message: 'Category deleted successfully' } },
  })
  @ApiNotFoundResponse({
    description: 'Category not found / User not found',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Нет прав (не ADMIN)',
    type: ErrorResponseDto,
  })
  async deleteCategory(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.categoriesService.deleteCategory(id, req.user.sub);

    return { message: 'Category deleted successfully' };
  }
}
