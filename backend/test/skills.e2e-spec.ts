import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeedUserData } from '../src/seeding/seed-user.data';
import { AuthService } from '../src/auth/auth.service';

describe('SkillsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let mockCategoryId: string;
  let userRepository: Repository<User>;
  let authService: AuthService;

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
    userRepository = moduleFixture.get(getRepositoryToken(User));
    authService = moduleFixture.get<AuthService>(AuthService);

    // Находим тестового пользователя
    const testUser = await userRepository.findOne({
      where: { email: SeedUserData[0].email },
    });

    if (!testUser) {
      throw new Error(
        `Test user with email ${SeedUserData[0].email} not found in database. Please check seeding.`,
      );
    }
    // Генерируем JWT‑токен для тестового пользователя
    accessToken = (
      await authService.login(SeedUserData[0].email, SeedUserData[0].password)
    ).accessToken;

    const category = await dataSource.getRepository('Category').save({
      name: 'Test name Category',
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
