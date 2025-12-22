import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FinancialModule } from './financial/financial.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { StudentsModule } from './students/students.module';
import { N8nWebhooksModule } from './n8n-webhooks/n8n-webhooks.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    FinancialModule,
    CheckInsModule,
    StudentsModule,
    N8nWebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplica LoggerMiddleware em todas as rotas
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
