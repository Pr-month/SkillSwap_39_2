import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('SkillsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let mockCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await app.init();
    dataSource = app.get(DataSource);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test-skills@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

    if (loginRes.status !== 201) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test-skills@example.com', password: 'Password123!' });
      accessToken = res.body.accessToken;
    } else {
      accessToken = loginRes.body.accessToken;
    }

    const category = await dataSource.getRepository('Category').save({
      title: 'Test Category',
      description: 'Test Description',
    });
    mockCategoryId = category.id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/skills (GET)', () => {
    it('должен возвращать список навыков и статус 200', () => {
      return request(app.getHttpServer())
        .get('/skills')
        .expect(200)
        .expect((res) => {
          // Проверка структуры пагинации
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/skills (POST)', () => {
    it('должен успешно создать новый навык при наличии токена', () => {
      return request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'E2E Test Skill',
          description: 'This is a test description for E2E',
          images: ['https://test.com/img.jpg'],
          categoryId: mockCategoryId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('E2E Test Skill');
          expect(res.body).toHaveProperty('id');
        });
    });

    it('должен возвращать 401 (Unauthorized) при отсутствии токена', () => {
      return request(app.getHttpServer())
        .post('/skills')
        .send({ title: 'Unauthorized' })
        .expect(401);
    });
  });
});
