import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { EmployeeCheckInDto } from './dto/employee-check-in.dto';
import { QueryCheckInsDto } from './dto/query-check-ins.dto';

@Controller('check-ins')
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  /**
   * Realizar check-in
   */
  @Post()
  create(
    @Body() createCheckInDto: CreateCheckInDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.checkInsService.create(createCheckInDto, userId);
  }

  /**
   * Check-in via identificador (CPF ou email) para funcionários/coaches
   */
  @Post('employee')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH, UserRole.FUNCIONARIO)
  employeeCheckIn(
    @Body() dto: EmployeeCheckInDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.checkInsService.employeeCheckIn(dto, userId);
  }

  /**
   * Listar check-ins
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH, UserRole.FUNCIONARIO)
  findAll(
    @Query() queryDto: QueryCheckInsDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.checkInsService.findAll(queryDto, userId, role);
  }

  /**
   * Check-ins de hoje (dashboard)
   */
  @Get('today')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH, UserRole.FUNCIONARIO)
  getTodayCheckIns() {
    return this.checkInsService.getTodayCheckIns();
  }

  /**
   * Buscar check-in por ID
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.checkInsService.findOne(id, userId, role);
  }

  /**
   * Histórico de check-ins de um usuário
   */
  @Get('user/:userId/history')
  getUserHistory(
    @Param('userId') targetUserId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.checkInsService.getUserHistory(targetUserId, userId, role);
  }

  /**
   * Estatísticas de check-ins de um usuário
   */
  @Get('user/:userId/stats')
  getUserStats(
    @Param('userId') targetUserId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.checkInsService.getUserStats(targetUserId, userId, role);
  }

  /**
   * Deletar check-in (apenas MASTER)
   */
  @Delete(':id')
  @Roles(UserRole.MASTER)
  remove(@Param('id') id: string) {
    return this.checkInsService.remove(id);
  }
}
