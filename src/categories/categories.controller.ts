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
import { Category } from './entities/category.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Post()
  async createCategory(
    @Req() req: RequestWithUser,
    @Body() category: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(category);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(id, category);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserRole.ADMIN])
  @Delete(':id')
  async deleteCategory(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.categoriesService.deleteCategory(id, req.user.sub);

    return { message: 'Category deleted successfully' };
  }
}
