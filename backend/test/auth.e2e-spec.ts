import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
  HttpStatus,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './../src/app.module';
import { AllExceptionFilter } from './../src/common/all-exception.filter';
import { DataSource } from 'typeorm';
import { seedCities } from 'src/seeding/seed-cities';

describe('AuthController (E2E)', () => {
  let app: INestApplication<App>;

  const user = {
    email: `e2e_${Date.now()}@mail.com`,
    password: 'StrongPass123',
    name: 'E2E User',
    gender: 'MALE',
    cityId: '',
    about: 'test user',
    birthdate: '1999-01-01',
  };

  let accessToken: string;
  let refreshToken: string;
  let cityId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

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

    const dataSource = app.get(DataSource);
    await seedCities(dataSource);

    const citiesRes = await request(app.getHttpServer())
      .get('/cities')
      .expect(HttpStatus.OK);

    expect(citiesRes.body.length).toBeGreaterThan(0);

    cityId = citiesRes.body[0].id;
    user.cityId = cityId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('должен зарегистрировать пользователя', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('должен вернуть 409 при повторной регистрации', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(HttpStatus.CONFLICT);
    });

    it('должен вернуть 400 при невалидном email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...user,
          email: 'bad-email',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('должен вернуть 400 при коротком пароле', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...user,
          email: `new_${Date.now()}@mail.com`,
          password: '123',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/login', () => {
    it('должен логинить пользователя', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('должен вернуть 401 при неверном пароле', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: 'wrong-password',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('должен вернуть 401 если пользователь не найден', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@mail.com',
          password: '123456',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/refresh', () => {
    it('должен обновить токены через Bearer refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('должен вернуть 401 без refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('должен вернуть 401 с невалидным refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer fake-token')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/logout', () => {
    it('должен разлогинить пользователя', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    });

    it('после logout refresh должен перестать работать', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('должен вернуть 401 без access token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
