import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;

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

    const testUser = {
      email: 'e2e-user@example.com',
      password: 'Password123!',
      name: 'E2E Test User',
    };

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    if (registerRes.status === 201) {
      accessToken = registerRes.body.accessToken;
      userId = registerRes.body.user.id;
    } else {
      // Если пользователь уже есть, просто логинимся
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      accessToken = loginRes.body.accessToken;
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('/users/me (GET)', () => {
    it('должен возвращать данные текущего профиля', () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('e2e-user@example.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('должен возвращать 401, если токен отсутствует', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('/users/me (PATCH)', () => {
    it('должен успешно обновить имя пользователя', () => {
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated E2E Name' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated E2E Name');
        });
    });

    it('должен возвращать 400 при передаче невалидных данных', () => {
      return request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'not-an-email' }) // Email менять через PATCH /me нельзя по DTO
        .expect(400);
    });
  });

  describe('/users/me/password (POST)', () => {
    it('должен успешно сменить пароль', () => {
      return request(app.getHttpServer())
        .post('/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'e2e-user@example.com',
          password: 'NewStrongPassword123!',
        })
        .expect(201);
    });
  });

  describe('/users (GET)', () => {
    it('должен возвращать список всех пользователей (публичный эндпоинт)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
