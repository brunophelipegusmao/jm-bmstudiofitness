import { Controller, Get, Query } from '@nestjs/common';

import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Estatísticas resumidas do dashboard
   * Para ADMIN, MASTER, COACH, FUNCIONARIO
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH, UserRole.FUNCIONARIO)
  getStats() {
    return this.dashboardService.getStats();
  }

  /**
   * Estatísticas detalhadas com listas
   * Para ADMIN, MASTER
   */
  @Get('detailed')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getDetailedStats() {
    return this.dashboardService.getDetailedStats();
  }

  /**
   * Estatísticas de check-ins por período
   * Para ADMIN, MASTER, COACH
   */
  @Get('check-ins')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH)
  getCheckInStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getCheckInStats(startDate, endDate);
  }

  /**
   * Estatísticas financeiras por período
   * Para ADMIN, MASTER
   */
  @Get('financial')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getFinancialStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getFinancialStats(startDate, endDate);
  }
}
