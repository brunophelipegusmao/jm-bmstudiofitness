import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
