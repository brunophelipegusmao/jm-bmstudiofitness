import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Delete,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import { CreateHealthMetricsDto } from './dto/create-health-metrics.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateHealthMetricsDto } from './dto/update-health-metrics.dto';
import {
  CreatePersonalEventDto,
  UpdatePersonalEventStatusDto,
  UpdatePersonalEventDto,
} from './dto/personal-event.dto';
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
   * Buscar dados do proprio aluno autenticado
   */
  @Get('me')
  getMe(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.getDashboardData(userId, role);
  }

  /**
   * Historico de saude do proprio aluno
   */
  @Get('health/history')
  getMyHealthHistory(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.getHealthHistory(userId, role);
  }

  /**
   * Listar notificacoes de eventos pessoais pendentes (ADMIN/MASTER/FUNCIONARIO)
   */
  @Get('personal-events/pending')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  getPendingPersonalEvents() {
    return this.studentsService.listAllPendingPersonalEvents();
  }

  /**
   * Eventos pessoais do aluno autenticado
   */
  @Get('personal-events')
  getMyPersonalEvents(@CurrentUser('userId') userId: string) {
    return this.studentsService.listPersonalEvents(userId);
  }

  @Post('personal-events')
  @Roles(UserRole.ALUNO, UserRole.MASTER)
  createPersonalEvent(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePersonalEventDto,
  ) {
    return this.studentsService.createPersonalEvent(userId, dto);
  }

  @Post('personal-events/:id/request-public')
  @Roles(UserRole.ALUNO, UserRole.MASTER)
  requestPublic(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.studentsService.requestPublicEvent(userId, id);
  }

  @Patch('personal-events/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH, UserRole.FUNCIONARIO)
  approvePersonalEvent(
    @Param('id') id: string,
    @Body() dto: UpdatePersonalEventStatusDto,
  ) {
    return this.studentsService.approvePersonalEvent(id, dto.approve ?? true);
  }

  @Patch('personal-events/:id')
  @Roles(UserRole.ALUNO, UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  updatePersonalEvent(
    @Param('id') id: string,
    @Body() dto: UpdatePersonalEventDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.updatePersonalEvent(id, dto, userId, role);
  }

  @Delete('personal-events/:id')
  @Roles(UserRole.ALUNO, UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  deletePersonalEvent(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.studentsService.deletePersonalEvent(id, userId, role);
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
   * Buscar metricas de saude
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
   * Criar metricas de saude (COACH+)
   */
  @Post('health')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  createHealthMetrics(@Body() createHealthMetricsDto: CreateHealthMetricsDto) {
    return this.studentsService.createHealthMetrics(createHealthMetricsDto);
  }

  /**
   * Atualizar metricas de saude (com verificacao de permissoes)
   */
  @Patch(':id/health')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
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
   * Adicionar observacao publica (COACH+)
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
   * Adicionar observacao privada (COACH+)
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
