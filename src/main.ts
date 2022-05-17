import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Nest Aluxion test')
    .setVersion('1.0')
    .addTag('files')
    .addTag('auth')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.useGlobalPipes(new ValidationPipe());

  SwaggerModule.setup('swagger', app, document);

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(parseInt(configService.get('PORT')) || 3000);
}
bootstrap();
