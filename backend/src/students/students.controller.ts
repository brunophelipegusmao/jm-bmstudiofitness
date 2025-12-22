import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateHealthMetricsDto } from './dto/create-health-metrics.dto';
import { UpdateHealthMetricsDto } from './dto/update-health-metrics.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../database/schema';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Listar alunos (COACH+)
   */
  @Get()
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.MASTER)
  findAll(@Query() queryDto: QueryStudentsDto) {
    return this.studentsService.findAll(queryDto);
  }

  /**
   * Buscar aluno por ID
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.findOne(id, userId, role);
  }

  /**
   * Buscar métricas de saúde
   */
  @Get(':id/health')
  getHealthMetrics(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.getHealthMetrics(id, userId, role);
  }

  /**
   * Criar métricas de saúde (COACH+)
   */
  @Post('health')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.MASTER)
  createHealthMetrics(@Body() createHealthMetricsDto: CreateHealthMetricsDto) {
    return this.studentsService.createHealthMetrics(createHealthMetricsDto);
  }

  /**
   * Atualizar métricas de saúde (com verificação de permissões)
   */
  @Patch(':id/health')
  updateHealthMetrics(
    @Param('id') id: string,
    @Body() updateHealthMetricsDto: UpdateHealthMetricsDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.updateHealthMetrics(
      id,
      updateHealthMetricsDto,
      userId,
      role,
    );
  }

  /**
   * Adicionar observação pública (COACH+)
   */
  @Post(':id/observations')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.MASTER)
  addPublicObservation(
    @Param('id') id: string,
    @Body('observation') observation: string,
  ) {
    return this.studentsService.addCoachObservation(id, observation, false);
  }

  /**
   * Adicionar observação privada (COACH+)
   */
  @Post(':id/observations/private')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.MASTER)
  addPrivateObservation(
    @Param('id') id: string,
    @Body('observation') observation: string,
  ) {
    return this.studentsService.addCoachObservation(id, observation, true);
  }
}
