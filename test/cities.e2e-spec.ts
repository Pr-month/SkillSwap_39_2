import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import { AllExceptionFilter } from './../src/common/all-exception.filter';
import { AppModule } from './../src/app.module';

describe('CitiesController (E2E with Pre‑seeded Data)', () => {
  let app: INestApplication<App>;
  beforeEach(async () => {
    // Создаём тестовый модуль с реальной конфигурацией DataSource
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalFilters(new AllExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cities', () => {
    it('должен вернуть все города', async () => {
      const response = await request(app.getHttpServer())
        .get('/cities')
        .expect(200);

      //Проверяем, что ответ не пустой и содержит данные
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0); // Ответ не пустой

      //Проверяем соответствие структуры данных
      response.body.forEach((city) => {
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('name');
      });
    });
  });

  describe('GET /cities/search', () => {
    it('должен искать города по названию (Москва)', async () => {
      const searchQuery = 'Москва';

      const response = await request(app.getHttpServer())
        .get(`/cities/search?search=${searchQuery}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Москва');
    });

    it('должен находить города по части названия (Павловск)', async () => {
      const searchQuery = 'Павл';

      const response = await request(app.getHttpServer())
        .get(`/cities/search?search=${searchQuery}`)
        .expect(200);

      //Есть хотя бы один результат
      expect(response.body.length).toBeGreaterThan(0);

      //Среди найденных должен быть Павловск
      const foundCity = response.body.find((city) => city.name === 'Павловск');
      expect(foundCity).toBeDefined();
    });

    it('должен ограничивать количество результатов (limit=1)', async () => {
      const limit = 10;

      const response = await request(app.getHttpServer())
        .get(`/cities/search?limit=${limit}`)
        .expect(200);

      //Проверяем что limit записей
      expect(response.body.length).toBe(limit);
    });

    it('должен обрабатывать комбинацию search и limit', async () => {
      const search = 'Павл';
      const limit = 1;

      const response = await request(app.getHttpServer())
        .get(`/cities/search?search=${search}&limit=${limit}`)
        .expect(200);

      //Проверяем что одна запись
      expect(response.body.length).toBe(1);
    });

    it('должен возвращать пустой массив при отсутствии совпадений', async () => {
      const search = 'НеСуществующийГород';

      const response = await request(app.getHttpServer())
        .get(`/cities/search?search=${search}`)
        .expect(200);
      //Пустой массив
      expect(response.body).toEqual([]);
    });
  });
});
