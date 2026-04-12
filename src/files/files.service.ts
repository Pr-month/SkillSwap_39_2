import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

// Конфигурация
const fileConfig = {
  minSizeFile: 1 * 1024, // 1 КБ
  uploadPath: path.resolve(
    path.join(__dirname, '../..'),
    process.env.FILES_PATH_IMG || 'public/uploads',
  ),
};

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File) {
    // Проверка размера файла
    if (file.size < fileConfig.minSizeFile) {
      await fs.unlink(file.path);
      throw new BadRequestException('Размер файла слишком мал');
    }

    const filePath = file.path;

    try {
      const uploadDir = fileConfig.uploadPath;
      if (!(await this.dirExists(uploadDir))) {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Перемещаем файл из временной папки в постоянную
      const finalPath = path.join(uploadDir, file.filename);
      await fs.rename(filePath, finalPath);

      const fileName = `/${process.env.FILES_PATH_IMG || 'public/uploads'}/${file.filename}`;

      return {
        statusCode: 201,
        message: 'Файл успешно загружен',
        data: {
          fileName,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
        },
      };
    } catch (error) {
      // Если произошла ошибка, удаляем временный файл
      console.log(`Saving file error: ${error}`);
      await fs.unlink(filePath).catch(() => {});
      throw new BadRequestException('Ошибка при сохранении файла');
    }
  }

  private async dirExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
