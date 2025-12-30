import { Module } from '@nestjs/common';
import { BodyMeasurementsController } from './body-measurements.controller';
import { BodyMeasurementsService } from './body-measurements.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BodyMeasurementsController],
  providers: [BodyMeasurementsService],
  exports: [BodyMeasurementsService],
})
export class BodyMeasurementsModule {}
