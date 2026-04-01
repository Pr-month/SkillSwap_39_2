import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TAppConfig } from './config/app.config';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AllExceptionFilter } from './common/all-exception.filter';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionFilter());

  const configService = app.get(ConfigService);
  const appConfigData = configService.get<TAppConfig>('APP_CONFIG');
  const swaggerConfigData = configService.get<TSwaggerConfig>('SWAGGER_CONFIG');

  if (swaggerConfigData?.enabled !== false) {
    const SwaggerConfig = new DocumentBuilder()
      .setTitle(swaggerConfigData?.title ?? 'SkillSwap API')
      .setDescription(
        swaggerConfigData?.description ??
          'API documentation for SkillSwap platform',
      )
      .setVersion(swaggerConfigData?.version ?? '1.0')
      .build();

    const document = SwaggerModule.createDocument(app, SwaggerConfig);
    SwaggerModule.setup(swaggerConfigData?.path ?? 'api/docs', app, document);
  }

  await app.listen(appConfigData?.port ?? 3000);
}

void bootstrap();
