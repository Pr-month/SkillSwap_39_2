import {
  ClassSerializerInterceptor,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import request from 'supertest';
import { AllExceptionFilter } from '../src/common/all-exception.filter';
import { Reflector } from '@nestjs/core';

describe('FilesController (e2e)', () => {
  let app: INestApplication;
  const testTempDir = path.join(
    __dirname,
    '..',
    process.env.FILES_PATH_TEMP || 'public/test-temp',
  );
  const testUploadDir = path.join(
    __dirname,
    '..',
    process.env.FILES_PATH_IMG || 'public/test-uploads',
  );

  const fixturesDir = path.join(__dirname, 'fixtures');

  beforeAll(async () => {
    if (!fsSync.existsSync(testTempDir)) {
      await fs.mkdir(testTempDir, { recursive: true });
    }
    if (!fsSync.existsSync(testUploadDir)) {
      await fs.mkdir(testUploadDir, { recursive: true });
    }

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

    await fs.rm(testTempDir, { recursive: true, force: true });
    await fs.rm(testUploadDir, { recursive: true, force: true });
  });

  describe('POST /upload - успешная загрузка', () => {
    it('должен успешно загрузить PNG файл', async () => {
      const testFilePath = path.join(fixturesDir, 'test-png.png');

      const response = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('message', 'Файл успешно загружен');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('fileName');
      expect(response.body.data).toHaveProperty('originalName', 'test-png.png');
      expect(response.body.data).toHaveProperty('size');
      expect(response.body.data).toHaveProperty('mimeType', 'image/png');
      expect(response.body.data.fileName).toMatch(
        /\/test-uploads\/\d+_[a-z0-9]+\.png$/,
      );

      const fileName = response.body.data.fileName;
      const relativePath = fileName.slice(1);
      const fullPath = path.join(__dirname, '..', relativePath);

      const fileExists = fsSync.existsSync(fullPath);
      expect(fileExists).toBe(true);

      const stats = await fs.stat(fullPath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('должен успешно загрузить JPG файл', async () => {
      const testFilePath = path.join(fixturesDir, 'test-jpg.jpeg');

      const response = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath)
        .expect(HttpStatus.CREATED);

      expect(response.body.data.mimeType).toBe('image/jpeg');
      expect(response.body.data.fileName).toMatch(/\.jpe?g$/);
      expect(response.body.data.originalName).toBe('test-jpg.jpeg');
    });
    it('должен генерировать уникальные имена для одинаковых файлов', async () => {
      const testFilePath1 = path.join(fixturesDir, 'test-png.png');
      const testFilePath2 = path.join(fixturesDir, 'test-png.png');

      const response1 = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath1)
        .expect(HttpStatus.CREATED);

      const response2 = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath2)
        .expect(HttpStatus.CREATED);

      expect(response1.body.data.fileName).not.toBe(
        response2.body.data.fileName,
      );
    });
  });

  describe('POST /upload - ошибки валидации', () => {
    it('должен вернуть ошибку при отсутствии файла', async () => {
      const response = await request(app.getHttpServer())
        .post('/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message.message).toBe('Файл не загружен');
    });

    it('должен вернуть ошибку при очень маленьком файле (меньше 1KB)', async () => {
      const testFilePath = path.join(testTempDir, 'test-small.jpeg');
      const smallContent = Buffer.alloc(500);
      await fs.writeFile(testFilePath, smallContent);

      const response = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message.message).toBe('Размер файла слишком мал');
    });

    it('должен вернуть ошибку при файле больше лимита (2MB)', async () => {
      const testFilePath = path.join(testTempDir, 'test-big.jpg');
      const largeContent = Buffer.alloc(3 * 1024 * 1024);
      await fs.writeFile(testFilePath, largeContent);

      const response = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath)
        .expect(HttpStatus.PAYLOAD_TOO_LARGE);

      expect(response.body.message).toBeDefined();
    });

    it('должен отклонить файл неподдерживаемого типа (TXT)', async () => {
      const testFilePath = path.join(testTempDir, 'test.txt');
      await fs.writeFile(testFilePath, 'Hello world');

      const response = await request(app.getHttpServer())
        .post('/upload')
        .attach('file', testFilePath)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBeDefined();
    });

    it('должен вернуть ошибку при неправильном имени поля', async () => {
      const testFilePath = path.join(fixturesDir, 'test-jpg.jpeg');

      const response = await request(app.getHttpServer())
        .post('/upload')
        .attach('wrongFieldName', testFilePath)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message.message).toContain('Unexpected field');
    });
  });
});
