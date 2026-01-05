import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Guards globais de autenticação e autorização
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // CORS para o frontend Next.js (múltiplas portas)
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [];

  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://192.168.18.2:3000',
    'http://192.168.18.2:3002',
    'http://192.168.18.2:3003',
    'http://192.168.18.2:3004',
    'https://jmfitnessstudio.com.br',
    ...envOrigins,
  ]);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (como curl, Postman) em desenvolvimento
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Prefixo global para rotas
  app.setGlobalPrefix('api');

  // Swagger (OpenAPI) em /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('JM Fitness API')
    .setDescription('Documentação da API NestJS')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  });
  app.getHttpAdapter().getInstance().get('/api/docs-json', (_req, res) => {
    res.json(swaggerDocument);
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 NestJS Backend rodando em: http://localhost:${port}/api`);
  console.log(`🔒 Guards globais: JWT + RBAC ativos`);
  console.log(`📝 Logging e Request-ID habilitados`);
}
bootstrap();
