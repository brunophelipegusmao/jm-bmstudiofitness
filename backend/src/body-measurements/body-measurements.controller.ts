import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BodyMeasurementsService } from './body-measurements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import {
  CreateBodyMeasurementDto,
  UpdateBodyMeasurementDto,
  QueryMeasurementsDto,
} from './dto/body-measurement.dto';

@Controller('body-measurements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BodyMeasurementsController {
  constructor(
    private readonly bodyMeasurementsService: BodyMeasurementsService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async findAll(@Query() query: QueryMeasurementsDto) {
    return this.bodyMeasurementsService.findAll(query);
  }

  @Get('student/:studentId')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO, UserRole.ALUNO)
  async findByStudent(@Param('studentId') studentId: string) {
    return this.bodyMeasurementsService.findByStudent(studentId);
  }

  @Get('student/:studentId/progress')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO, UserRole.ALUNO)
  async getProgress(@Param('studentId') studentId: string) {
    return this.bodyMeasurementsService.getProgress(studentId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async findOne(@Param('id') id: string) {
    return this.bodyMeasurementsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async create(@Body() dto: CreateBodyMeasurementDto, @Request() req: any) {
    return this.bodyMeasurementsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async update(@Param('id') id: string, @Body() dto: UpdateBodyMeasurementDto) {
    return this.bodyMeasurementsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async delete(@Param('id') id: string) {
    return this.bodyMeasurementsService.delete(id);
  }
}
