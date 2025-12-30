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
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeesDto,
} from './dto/employee.dto';
import {
  CreateTimeRecordDto,
  UpdateTimeRecordDto,
  QueryTimeRecordsDto,
} from './dto/time-record.dto';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // ==================== EMPLOYEE ENDPOINTS ====================

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findAll(@Query() query: QueryEmployeesDto) {
    return this.employeesService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async findByUserId(@Param('userId') userId: string) {
    return this.employeesService.findByUserId(userId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async create(@Body() dto: CreateEmployeeDto, @Request() req: any) {
    return this.employeesService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Request() req: any,
  ) {
    return this.employeesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async softDelete(@Param('id') id: string) {
    return this.employeesService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async restore(@Param('id') id: string) {
    return this.employeesService.restore(id);
  }

  @Get(':id/salary-history')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async getSalaryHistory(@Param('id') id: string) {
    return this.employeesService.getSalaryHistory(id);
  }

  // ==================== TIME RECORD ENDPOINTS ====================

  @Get('time-records/all')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async findAllTimeRecords(@Query() query: QueryTimeRecordsDto) {
    return this.employeesService.findAllTimeRecords(query);
  }

  @Get('time-records/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async findTimeRecord(@Param('id') id: string) {
    return this.employeesService.findTimeRecord(id);
  }

  @Post('time-records')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async createTimeRecord(@Body() dto: CreateTimeRecordDto) {
    return this.employeesService.createTimeRecord(dto);
  }

  @Patch('time-records/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO)
  async updateTimeRecord(
    @Param('id') id: string,
    @Body() dto: UpdateTimeRecordDto,
  ) {
    return this.employeesService.updateTimeRecord(id, dto);
  }

  @Post('time-records/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async approveTimeRecord(@Param('id') id: string, @Request() req: any) {
    return this.employeesService.approveTimeRecord(id, req.user.id);
  }

  @Delete('time-records/:id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async deleteTimeRecord(@Param('id') id: string) {
    return this.employeesService.deleteTimeRecord(id);
  }

  // ==================== REPORTS ====================

  @Get(':id/report')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  async getEmployeeReport(
    @Param('id') id: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const monthNum = parseInt(month, 10) || new Date().getMonth() + 1;
    const yearNum = parseInt(year, 10) || new Date().getFullYear();
    return this.employeesService.getEmployeeReport(id, monthNum, yearNum);
  }
}
