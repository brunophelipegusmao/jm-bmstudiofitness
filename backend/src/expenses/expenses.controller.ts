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
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  QueryExpensesDto,
} from './dto/expense.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAll(@Query() query: QueryExpensesDto) {
    return this.expensesService.findAll(query);
  }

  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async getCategories() {
    return this.expensesService.getCategories();
  }

  @Get('report')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async getMonthlyReport(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const monthNum = parseInt(month, 10) || new Date().getMonth() + 1;
    const yearNum = parseInt(year, 10) || new Date().getFullYear();
    return this.expensesService.getMonthlyReport(monthNum, yearNum);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async create(@Body() dto: CreateExpenseDto, @Request() req: any) {
    return this.expensesService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async softDelete(@Param('id') id: string) {
    return this.expensesService.softDelete(id);
  }
}
