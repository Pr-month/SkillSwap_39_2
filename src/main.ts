import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TAppConfig } from './config/app.config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter());

  const configService = app.get(ConfigService);
  const appConfigData = configService.get<TAppConfig>('APP_CONFIG');
  await app.listen(appConfigData?.port ?? 3000);
}
void bootstrap();
