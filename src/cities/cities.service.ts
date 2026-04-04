import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async findAll() {
    return this.cityRepository.find({
      select: ['id', 'name'],
    });
  }

  async findAllWithFilters(search?: string, limit?: number): Promise<City[]> {
    const qb = this.cityRepository.createQueryBuilder('city');

    qb.select(['city.id', 'city.name']);

    if (search && search.trim()) {
      qb.where('city.name ILIKE :search', { search: `%${search.trim()}%` });
    }

    if (limit !== undefined && limit > 0) {
      qb.take(limit);
    }

    return qb.getMany();
  }
}
