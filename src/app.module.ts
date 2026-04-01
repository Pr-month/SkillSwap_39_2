import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { dbConfig, TDBConfig } from './config/db.config';
import { jwtConfig } from './config/jwt.config';
import { appConfig } from './config/app.config';
import { SkillsModule } from './skills/skills.module';
import { FilesModule } from './files/files.module';
import { CategoriesModule } from './categories/categories.module';
import { RequestsModule } from './requests/requests.module';
import { swaggerConfig } from './config/swagger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, jwtConfig, appConfig, swaggerConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (config: TDBConfig) => config,
    }),
    AuthModule,
    UsersModule,
    SkillsModule,
    FilesModule,
    CategoriesModule,
    RequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
