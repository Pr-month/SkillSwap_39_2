import { Controller, Get, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { GetCitiesDto } from './dto/get-cities.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async findAll() {
    return await this.citiesService.findAll();
  }

  @Get('search')
  async findAllWithFilters(@Query() query: GetCitiesDto) {
    return await this.citiesService.findAllWithFilters(
      query.search,
      query.limit,
    );
  }
}
