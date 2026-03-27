import {
  Controller,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multerConfig from '../common/file';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { FilesService } from './files.service';

@Controller('upload')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

 // @UseGuards(JwtAuthGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    return await this.filesService.uploadFile(file);
  }
}