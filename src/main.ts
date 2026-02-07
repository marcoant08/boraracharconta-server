import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './presentation/filters/http-exception.filter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Filtro de exceções global
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Validação global
    app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS - Configurado para funcionar com HTTP e WebSocket
  app.enableCors({
    origin: '*', // Em produção, especificar domínios permitidos
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Divisão de Contas API')
    .setDescription('API para divisão de contas entre amigos')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação')
    .addTag('bills', 'Gerenciamento de Contas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3000;
    
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation: http://localhost:${port}/docs`);
  } catch (error) {
    console.error('[main] ERROR during bootstrap:', error);
    console.error('[main] Error stack:', error.stack);
    throw error;
  }
}

bootstrap();
