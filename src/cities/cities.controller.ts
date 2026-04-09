import { Controller, Get, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { GetCitiesDto } from './dto/get-cities.dto';
import { ApiFindAllCities, ApiSearchCities } from './cities.swagger';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiFindAllCities()
  async findAll() {
    return await this.citiesService.findAll();
  }

  @Get('search')
  @ApiSearchCities()
  async findAllWithFilters(@Query() query: GetCitiesDto) {
    return await this.citiesService.findAllWithFilters(
      query.search,
      query.limit,
    );
  }
}
