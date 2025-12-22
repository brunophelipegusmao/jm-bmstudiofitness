import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto, MarkAsPaidDto } from './dto/update-financial.dto';
import { QueryFinancialDto } from './dto/query-financial.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../database/schema';

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
   * Listar registros (com permissões)
   */
  @Get()
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
   * Buscar por ID
   */
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.financialService.findOne(id, userId, role);
  }

  /**
   * Buscar por usuário
   */
  @Get('user/:userId')
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
   * Deletar registro (apenas MASTER)
   */
  @Delete(':id')
  @Roles(UserRole.MASTER)
  remove(@Param('id') id: string) {
    return this.financialService.remove(id);
  }
}
