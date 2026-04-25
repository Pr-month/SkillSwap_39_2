import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multerConfig from '../common/file';
import { FilesService } from './files.service';
import { ApiUploadFile } from './files.swagger';

@Controller('upload')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiUploadFile()
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    return await this.filesService.uploadFile(file);
  }
}
