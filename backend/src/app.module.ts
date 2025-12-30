import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { BodyMeasurementsModule } from './body-measurements/body-measurements.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { DashboardModule } from './dashboard/dashboard.module';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
import { ExpensesModule } from './expenses/expenses.module';
import { FinancialModule } from './financial/financial.module';
import { N8nWebhooksModule } from './n8n-webhooks/n8n-webhooks.module';
import { PlansModule } from './plans/plans.module';
import { SettingsModule } from './settings/settings.module';
import { SetupModule } from './setup/setup.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { WaitlistModule } from './waitlist/waitlist.module';

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
    SettingsModule,
    SetupModule,
    DashboardModule,
    EmployeesModule,
    PlansModule,
    WaitlistModule,
    BlogModule,
    ExpensesModule,
    BodyMeasurementsModule,
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
