import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitiesService } from './cities.service';
import { City } from './entities/city.entity';

describe('CitiesService', () => {
  let service: CitiesService;
  let repository: Repository<City>;

  const mockCities = [
    { id: '4493db05-f0dc-49f1-a279-1165f3d72bcf', name: 'Москва', subject: 'Москва' },
    { id: '67cb336a-0a54-4dd2-80a3-9ac5f0497d62', name: 'Санкт-Петербург', subject: 'Санкт-Петербург' },
    { id: 'e9972e68-f72b-4273-b894-a92e33f55f24', name: 'Новосибирск', subject: 'Новосибирская область' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitiesService,
         {
          provide: getRepositoryToken(City),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);     
    repository = module.get<Repository<City>>(getRepositoryToken(City));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  describe('findAll', () => {
    it('should return all cities', async () => {      
      jest.spyOn(repository, 'find').mockResolvedValue(mockCities);    
      const result = await service.findAll();

      expect(result).toEqual(mockCities);      
    });

    
  });

  describe('findAllWithFilters', () => {
    //поиск по строке
    it('should return cities with search filter', async () => {
     
      const searchTerm = mockCities[0].name; //'Москва'
      const expectedQuery = `%${searchTerm.trim()}%`;

      jest.spyOn(repository.createQueryBuilder(), 'getMany').mockResolvedValue([mockCities[0]]);
      const result = await service.findAllWithFilters(searchTerm);

      expect(result).toEqual([mockCities[0]]);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith(
        'city.name ILIKE :search',
        { search: expectedQuery }
      );
    });
    //ограничение по количеству
    it('should return cities with limit', async () => {    
      const limit = 2;

      jest.spyOn(repository.createQueryBuilder(), 'getMany').mockResolvedValue([mockCities[0], mockCities[1]]);
      const result = await service.findAllWithFilters(undefined, limit);

      expect(result).toEqual([mockCities[0], mockCities[1]]);
      expect(repository.createQueryBuilder().take).toHaveBeenCalledWith(limit);
    });
    //без фильтров 
    it('should return all cities without filters', async () => {
      jest.spyOn(repository.createQueryBuilder(), 'getMany').mockResolvedValue(mockCities);
      const result = await service.findAllWithFilters();

      expect(result).toEqual(mockCities);
      expect(repository.createQueryBuilder().where).not.toHaveBeenCalled();
      expect(repository.createQueryBuilder().take).not.toHaveBeenCalled();
    });
    //пустая строка в search 
    it('should handle empty search string', async () => {
      jest.spyOn(repository.createQueryBuilder(), 'getMany').mockResolvedValue(mockCities);
      const result = await service.findAllWithFilters('   ');

      expect(result).toEqual(mockCities);
      expect(repository.createQueryBuilder().where).not.toHaveBeenCalled();
    });
  });

});
