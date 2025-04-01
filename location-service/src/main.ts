import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';  // Змінено імпорт

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Глобальні middleware
  app.use(compression());
  app.use(helmet());
  app.enableCors();
  
  // Валідація DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Налаштування Swagger документації
  const config = new DocumentBuilder()
    .setTitle('Location Service API')
    .setDescription('API для управління об\'єктами та елементами безбар\'єрності')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Старт сервера
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Location Service running on port ${port}`);
}

bootstrap();