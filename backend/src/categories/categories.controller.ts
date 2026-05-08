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
import { UserRole } from 'src/users/users.enums';
import { RequestWithUser } from '../auth/types/request-with-user.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  ApiCategoriesTag,
  ApiCategoriesGet,
  ApiCategoriesPost,
  ApiCategoriesPatch,
  ApiCategoriesDelete,
} from './categories.swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@ApiCategoriesTag()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiCategoriesGet()
  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Post()
  @ApiCategoriesPost()
  async createCategory(
    @Req() _req: RequestWithUser,
    @Body() category: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(category);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Patch(':id')
  @ApiCategoriesPatch()
  async updateCategory(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(id, category);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Delete(':id')
  @ApiCategoriesDelete()
  async deleteCategory(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.categoriesService.deleteCategory(id, req.user.sub);

    return { message: 'Category deleted successfully' };
  }
}
