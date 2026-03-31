import { Request } from 'express';
import * as fs from 'fs';
import * as multer from 'multer';
import { FileFilterCallback } from 'multer';
import * as path from 'path';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const tempDir = path.resolve(
  path.join(__dirname, '../..', process.env.FILES_PATH_TEMP || 'public/temp'),
);

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const generateFileName = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}${ext}`;
};

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: DestinationCallback,
  ) => {
    cb(null, tempDir);
  },

  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback,
  ) => {
    const uniqueName = generateFileName(file.originalname);
    cb(null, uniqueName);
  },
});

const types = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

const fileFilter = async (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const mimeType = file.mimetype.toLowerCase();

  if (!types.includes(file.mimetype)) {
    return cb(null, false);
  }

  return cb(null, true);
};

// Экспортируем конфигурацию, а не готовый экземпляр Multer
export default {
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 МБ
  },
};
