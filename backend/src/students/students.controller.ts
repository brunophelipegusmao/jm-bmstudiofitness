import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import { CreateHealthMetricsDto } from './dto/create-health-metrics.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateHealthMetricsDto } from './dto/update-health-metrics.dto';
import { StudentsService } from './students.service';

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
   * Dados completos (ADMIN/MASTER)
   */
  @Get(':id/full')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getFullProfile(@Param('id') id: string) {
    return this.studentsService.getFullProfile(id);
  }

  /**
   * Buscar dados do prÇüprio aluno autenticado
   */
  @Get('me')
  getMe(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.getDashboardData(userId, role);
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
   * Atualizar dados pessoais/financeiros do aluno (ADMIN/MASTER)
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.updateStudent(id, dto);
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
