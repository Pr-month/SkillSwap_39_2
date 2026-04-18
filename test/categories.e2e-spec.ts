import {
  ClassSerializerInterceptor,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';

import { AppModule } from 'src/app.module';
import { AllExceptionFilter } from 'src/common/all-exception.filter';
import { appConfig } from 'src/config/app.config';
import { seedAdmin } from 'src/seeding/seed-admin';
import { seedUser } from 'src/seeding/seed-user';
import { SeedUserData } from 'src/seeding/seed-user.data';
import { UserRole } from 'src/users/users.enums';
import { User } from 'src/users/entities/user.entity';

describe('CategoriesController (E2E)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  let adminAccessToken: string;
  let userAccessToken: string;

  const okLoginStatuses = [HttpStatus.OK, HttpStatus.CREATED];

  function assertLoginOk(name: string, res: request.Response) {
    if (!okLoginStatuses.includes(res.status)) {
      throw new Error(
        `${name} login failed: expected ${okLoginStatuses.join(' or ')}, got ${res.status}. Body: ${JSON.stringify(
          res.body,
        )}`,
      );
    }
    if (!res.body?.accessToken) {
      throw new Error(
        `${name} login failed: no accessToken in body. Body: ${JSON.stringify(
          res.body,
        )}`,
      );
    }
  }

  beforeAll(async () => {
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

    dataSource = app.get(DataSource);

    await dataSource.runMigrations();

    await seedAdmin(dataSource);
    await seedUser(dataSource);

    const cfg = appConfig();
    const userRepo = dataSource.getRepository(User);

    const adminInDb = await userRepo.findOne({
      where: { email: cfg.adminData.email },
    });
    expect(adminInDb).toBeTruthy();

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: cfg.adminData.email,
        password: cfg.adminData.password,
      });

    assertLoginOk('Admin', adminLoginRes);
    adminAccessToken = adminLoginRes.body.accessToken;

    const nonAdmin = SeedUserData.find((u) => u.role !== UserRole.ADMIN);
    if (!nonAdmin) {
      throw new Error('SeedUserData must contain at least one non-admin user');
    }

    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: nonAdmin.email,
        password: nonAdmin.password,
      });

    assertLoginOk('User', userLoginRes);
    userAccessToken = userLoginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /categories -> 200 (public)', async () => {
    const res = await request(app.getHttpServer()).get('/categories').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /categories -> 401 without token', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Programming' })
      .expect(401);
  });

  it('POST /categories -> 403 with non-admin token', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({ name: 'Programming' })
      .expect(403);
  });

  it('CRUD /categories with admin token', async () => {
    const rootName = `Programming_${Date.now()}`;

    const rootRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: rootName })
      .expect(201);

    const rootId: string = rootRes.body.id;

    await request(app.getHttpServer())
      .patch(`/categories/${rootId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: `Design_${Date.now()}` })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/categories/${rootId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);
  });
});