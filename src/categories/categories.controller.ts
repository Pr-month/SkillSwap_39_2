import { Controller, Delete, UseGuards, Param, Req, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/users.enums';
import { RequestWithUser } from '../auth/types/request-with-user.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }
  
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCategory(@Req() req: RequestWithUser, @Body() category: CreateCategoryDto) {
    return this.categoriesService.createCategory(category);
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
