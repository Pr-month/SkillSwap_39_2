import { Controller, Delete, UseGuards, Param, Req, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteCategory(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.categoriesService.deleteCategory(id, req.user.sub);

    return { message: 'Category deleted successfully' };
  }
}
