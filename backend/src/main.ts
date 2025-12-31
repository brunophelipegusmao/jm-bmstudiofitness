import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';

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
    }),
  );

  // Guards globais de autenticação e autorização
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // CORS para o frontend Next.js (múltiplas portas)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:8080',
    'http://192.168.18.2:3000',
    'http://192.168.18.2:3002',
    'http://192.168.18.2:3003',
    'http://192.168.18.2:3004',
    'https://jmfitnessstudio.com.br',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origin (como curl, Postman) em desenvolvimento
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Prefixo global para rotas
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 NestJS Backend rodando em: http://localhost:${port}/api`);
  console.log(`🔒 Guards globais: JWT + RBAC ativos`);
  console.log(`📝 Logging e Request-ID habilitados`);
}
bootstrap();
