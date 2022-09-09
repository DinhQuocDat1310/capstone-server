import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/appConfigService';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Brandvertise')
    .setContact('Brandvertise Admin', '', 'brandvertiseco1@gmail.com')
    .setDescription('The AdsOnCar API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({}));
  app.enableCors();
  const appConfigService = app.get<AppConfigService>(AppConfigService);
  await app.listen(appConfigService.port);
}
bootstrap();
