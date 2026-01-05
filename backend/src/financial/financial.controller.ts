import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { QueryFinancialDto } from './dto/query-financial.dto';
import { RemindFinancialDto } from './dto/remind-financial.dto';
import { MarkAsPaidDto, UpdateFinancialDto } from './dto/update-financial.dto';
import { FinancialService } from './financial.service';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  /**
   * Criar registro financeiro (ADMIN/MASTER)
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  create(@Body() createFinancialDto: CreateFinancialDto) {
    return this.financialService.create(createFinancialDto);
  }

  /**
   * Listar registros (restrito a ADMIN/MASTER)
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  findAll(
    @Query() queryDto: QueryFinancialDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.financialService.findAll(queryDto, userId, role);
  }

  /**
   * Relatório mensal (ADMIN/MASTER)
   */
  @Get('report/:year/:month')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getMonthlyReport(@Param('year') year: string, @Param('month') month: string) {
    return this.financialService.getMonthlyReport(Number(year), Number(month));
  }

  /**
   * Buscar por ID (restrito a ADMIN/MASTER)
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.financialService.findOne(id, userId, role);
  }

  /**
   * Buscar por usuário (restrito a ADMIN/MASTER)
   */
  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  findByUser(
    @Param('userId') targetUserId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.financialService.findByUser(targetUserId, userId, role);
  }

  /**
   * Atualizar registro (ADMIN/MASTER com permissão)
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  update(
    @Param('id') id: string,
    @Body() updateFinancialDto: UpdateFinancialDto,
  ) {
    return this.financialService.update(id, updateFinancialDto);
  }

  /**
   * Marcar como pago
   */
  @Post(':id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  markAsPaid(@Param('id') id: string, @Body() markAsPaidDto: MarkAsPaidDto) {
    return this.financialService.markAsPaid(id, markAsPaidDto);
  }

  /**
   * Enviar lembrete de cobrança (email/whatsapp)
   */
  @Post(':id/remind')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  remind(
    @Param('id') id: string,
    @Body() remindDto: RemindFinancialDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.financialService.remind(id, remindDto, userId);
  }

  /**
   * Deletar registro (apenas MASTER)
   */
  @Delete(':id')
  @Roles(UserRole.MASTER)
  remove(@Param('id') id: string) {
    return this.financialService.remove(id);
  }
}
