import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesService],
    }).compile();

    service = module.get<FilesService>(FilesService);

    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();

    // Настраиваем unlink, чтобы он всегда возвращал Promise
    // Это предотвратит ошибку "Cannot read properties of undefined (reading 'catch')"
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile = {
      size: 5000,
      path: 'temp/test.jpg',
      filename: 'test.jpg',
      originalname: 'original.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('должен выбросить ошибку, если файл слишком маленький', async () => {
      const smallFile = { ...mockFile, size: 100 } as Express.Multer.File;

      await expect(service.uploadFile(smallFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(smallFile)).rejects.toThrow(
        'Размер файла слишком мал',
      );
      expect(fs.unlink).toHaveBeenCalledWith(smallFile.path);
    });

    it('должен успешно сохранить файл и вернуть данные', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.rename as jest.Mock).mockResolvedValue(undefined);

      const result = await service.uploadFile(mockFile);

      expect(result.statusCode).toBe(201);
      expect(result.data.originalName).toBe('original.jpg');
      expect(fs.rename).toHaveBeenCalled();
    });

    it('должен выбросить ошибку и удалить временный файл при сбое сохранения', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      (fs.rename as jest.Mock).mockRejectedValue(new Error('Rename failed'));

      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.uploadFile(mockFile)).rejects.toThrow(
        'Ошибка при сохранении файла',
      );

      expect(fs.unlink).toHaveBeenCalledWith(mockFile.path);
    });
  });
});
