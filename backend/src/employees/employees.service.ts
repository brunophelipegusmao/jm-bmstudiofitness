import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../database/schema';
import {
  tbEmployees,
  tbEmployeeSalaryHistory,
  tbEmployeeTimeRecords,
  tbUsers,
  tbPersonalData,
} from '../database/schema';
import { eq, desc, and, gte, lte, isNull, sql, SQLWrapper } from 'drizzle-orm';
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

@Injectable()
export class EmployeesService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  // ==================== EMPLOYEE CRUD ====================

  async findAll(query: QueryEmployeesDto) {
    const conditions: SQLWrapper[] = [];

    // Por padrão, não retorna deletados
    if (!query.includeDeleted) {
      conditions.push(isNull(tbEmployees.deletedAt));
    }

    if (query.position) {
      conditions.push(eq(tbEmployees.position, query.position));
    }

    if (query.shift) {
      conditions.push(eq(tbEmployees.shift, query.shift));
    }

    const employees = await this.db
      .select({
        id: tbEmployees.id,
        userId: tbEmployees.userId,
        position: tbEmployees.position,
        shift: tbEmployees.shift,
        shiftStartTime: tbEmployees.shiftStartTime,
        shiftEndTime: tbEmployees.shiftEndTime,
        salaryInCents: tbEmployees.salaryInCents,
        hireDate: tbEmployees.hireDate,
        deletedAt: tbEmployees.deletedAt,
        createdAt: tbEmployees.createdAt,
        updatedAt: tbEmployees.updatedAt,
        user: {
          id: tbUsers.id,
          name: tbUsers.name,
          userRole: tbUsers.userRole,
          isActive: tbUsers.isActive,
        },
        personalData: {
          email: tbPersonalData.email,
          telephone: tbPersonalData.telephone,
        },
      })
      .from(tbEmployees)
      .innerJoin(tbUsers, eq(tbEmployees.userId, tbUsers.id))
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tbEmployees.createdAt));

    return employees;
  }

  async findOne(id: string) {
    const [employee] = await this.db
      .select({
        id: tbEmployees.id,
        userId: tbEmployees.userId,
        position: tbEmployees.position,
        shift: tbEmployees.shift,
        shiftStartTime: tbEmployees.shiftStartTime,
        shiftEndTime: tbEmployees.shiftEndTime,
        salaryInCents: tbEmployees.salaryInCents,
        hireDate: tbEmployees.hireDate,
        deletedAt: tbEmployees.deletedAt,
        createdAt: tbEmployees.createdAt,
        updatedAt: tbEmployees.updatedAt,
        user: {
          id: tbUsers.id,
          name: tbUsers.name,
          userRole: tbUsers.userRole,
          isActive: tbUsers.isActive,
        },
        personalData: {
          email: tbPersonalData.email,
          telephone: tbPersonalData.telephone,
        },
      })
      .from(tbEmployees)
      .innerJoin(tbUsers, eq(tbEmployees.userId, tbUsers.id))
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(eq(tbEmployees.id, id));

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employee;
  }

  async findByUserId(userId: string) {
    const [employee] = await this.db
      .select()
      .from(tbEmployees)
      .where(eq(tbEmployees.userId, userId));

    return employee || null;
  }

  async create(dto: CreateEmployeeDto, createdBy: string) {
    // Verifica se o usuário existe
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, dto.userId));

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verifica se já existe um funcionário para este usuário
    const existingEmployee = await this.findByUserId(dto.userId);
    if (existingEmployee) {
      throw new ConflictException(
        'Este usuário já está cadastrado como funcionário',
      );
    }

    const [employee] = await this.db
      .insert(tbEmployees)
      .values({
        userId: dto.userId,
        position: dto.position,
        shift: dto.shift,
        shiftStartTime: dto.shiftStartTime,
        shiftEndTime: dto.shiftEndTime,
        salaryInCents: dto.salaryInCents,
        hireDate: dto.hireDate,
      })
      .returning();

    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, updatedBy: string) {
    const employee = await this.findOne(id);

    // Se está alterando o salário, registra no histórico
    if (
      dto.salaryInCents !== undefined &&
      dto.salaryInCents !== employee.salaryInCents
    ) {
      await this.db.insert(tbEmployeeSalaryHistory).values({
        employeeId: id,
        previousSalaryInCents: employee.salaryInCents,
        newSalaryInCents: dto.salaryInCents,
        changeReason: dto.salaryChangeReason || null,
        changedBy: updatedBy,
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.shift !== undefined) updateData.shift = dto.shift;
    if (dto.shiftStartTime !== undefined)
      updateData.shiftStartTime = dto.shiftStartTime;
    if (dto.shiftEndTime !== undefined)
      updateData.shiftEndTime = dto.shiftEndTime;
    if (dto.salaryInCents !== undefined)
      updateData.salaryInCents = dto.salaryInCents;
    if (dto.hireDate !== undefined) updateData.hireDate = dto.hireDate;

    const [updated] = await this.db
      .update(tbEmployees)
      .set(updateData)
      .where(eq(tbEmployees.id, id))
      .returning();

    return updated;
  }

  async softDelete(id: string) {
    await this.findOne(id);

    const [deleted] = await this.db
      .update(tbEmployees)
      .set({ deletedAt: new Date() })
      .where(eq(tbEmployees.id, id))
      .returning();

    return deleted;
  }

  async restore(id: string) {
    const [employee] = await this.db
      .select()
      .from(tbEmployees)
      .where(eq(tbEmployees.id, id));

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    const [restored] = await this.db
      .update(tbEmployees)
      .set({ deletedAt: null })
      .where(eq(tbEmployees.id, id))
      .returning();

    return restored;
  }

  async getSalaryHistory(employeeId: string) {
    await this.findOne(employeeId);

    const history = await this.db
      .select({
        id: tbEmployeeSalaryHistory.id,
        previousSalaryInCents: tbEmployeeSalaryHistory.previousSalaryInCents,
        newSalaryInCents: tbEmployeeSalaryHistory.newSalaryInCents,
        changeReason: tbEmployeeSalaryHistory.changeReason,
        effectiveDate: tbEmployeeSalaryHistory.effectiveDate,
        createdAt: tbEmployeeSalaryHistory.createdAt,
        changedBy: {
          id: tbUsers.id,
          name: tbUsers.name,
        },
      })
      .from(tbEmployeeSalaryHistory)
      .innerJoin(tbUsers, eq(tbEmployeeSalaryHistory.changedBy, tbUsers.id))
      .where(eq(tbEmployeeSalaryHistory.employeeId, employeeId))
      .orderBy(desc(tbEmployeeSalaryHistory.createdAt));

    return history;
  }

  // ==================== TIME RECORDS ====================

  async findAllTimeRecords(query: QueryTimeRecordsDto) {
    const conditions: any[] = [];

    if (query.employeeId) {
      conditions.push(eq(tbEmployeeTimeRecords.employeeId, query.employeeId));
    }

    if (query.startDate) {
      conditions.push(gte(tbEmployeeTimeRecords.date, query.startDate));
    }

    if (query.endDate) {
      conditions.push(lte(tbEmployeeTimeRecords.date, query.endDate));
    }

    if (query.approved !== undefined) {
      const isApproved = query.approved === 'true';
      conditions.push(eq(tbEmployeeTimeRecords.approved, isApproved));
    }

    const records = await this.db
      .select({
        id: tbEmployeeTimeRecords.id,
        employeeId: tbEmployeeTimeRecords.employeeId,
        date: tbEmployeeTimeRecords.date,
        checkInTime: tbEmployeeTimeRecords.checkInTime,
        checkOutTime: tbEmployeeTimeRecords.checkOutTime,
        totalHours: tbEmployeeTimeRecords.totalHours,
        notes: tbEmployeeTimeRecords.notes,
        approved: tbEmployeeTimeRecords.approved,
        createdAt: tbEmployeeTimeRecords.createdAt,
        updatedAt: tbEmployeeTimeRecords.updatedAt,
        employee: {
          id: tbEmployees.id,
          position: tbEmployees.position,
          shift: tbEmployees.shift,
          userName: tbUsers.name,
        },
      })
      .from(tbEmployeeTimeRecords)
      .innerJoin(
        tbEmployees,
        eq(tbEmployeeTimeRecords.employeeId, tbEmployees.id),
      )
      .innerJoin(tbUsers, eq(tbEmployees.userId, tbUsers.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tbEmployeeTimeRecords.date));

    return records;
  }

  async findTimeRecord(id: string) {
    const [record] = await this.db
      .select()
      .from(tbEmployeeTimeRecords)
      .where(eq(tbEmployeeTimeRecords.id, id));

    if (!record) {
      throw new NotFoundException('Registro de ponto não encontrado');
    }

    return record;
  }

  async createTimeRecord(dto: CreateTimeRecordDto) {
    // Verifica se o funcionário existe
    await this.findOne(dto.employeeId);

    // Verifica se já existe registro para este funcionário nesta data
    const [existing] = await this.db
      .select()
      .from(tbEmployeeTimeRecords)
      .where(
        and(
          eq(tbEmployeeTimeRecords.employeeId, dto.employeeId),
          eq(tbEmployeeTimeRecords.date, dto.date),
        ),
      );

    if (existing) {
      throw new ConflictException(
        'Já existe um registro de ponto para este funcionário nesta data',
      );
    }

    // Calcula total de horas se entrada e saída foram informados
    let totalHours: string | null = null;
    if (dto.checkInTime && dto.checkOutTime) {
      totalHours = this.calculateTotalHours(dto.checkInTime, dto.checkOutTime);
    }

    const [record] = await this.db
      .insert(tbEmployeeTimeRecords)
      .values({
        employeeId: dto.employeeId,
        date: dto.date,
        checkInTime: dto.checkInTime || null,
        checkOutTime: dto.checkOutTime || null,
        totalHours,
        notes: dto.notes || null,
      })
      .returning();

    return record;
  }

  async updateTimeRecord(id: string, dto: UpdateTimeRecordDto) {
    const record = await this.findTimeRecord(id);

    if (record.approved) {
      throw new BadRequestException(
        'Não é possível alterar um registro de ponto já aprovado',
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    const checkIn =
      dto.checkInTime !== undefined ? dto.checkInTime : record.checkInTime;
    const checkOut =
      dto.checkOutTime !== undefined ? dto.checkOutTime : record.checkOutTime;

    if (dto.checkInTime !== undefined)
      updateData.checkInTime = dto.checkInTime || null;
    if (dto.checkOutTime !== undefined)
      updateData.checkOutTime = dto.checkOutTime || null;
    if (dto.notes !== undefined) updateData.notes = dto.notes || null;

    // Recalcula total de horas
    if (checkIn && checkOut) {
      updateData.totalHours = this.calculateTotalHours(checkIn, checkOut);
    }

    const [updated] = await this.db
      .update(tbEmployeeTimeRecords)
      .set(updateData)
      .where(eq(tbEmployeeTimeRecords.id, id))
      .returning();

    return updated;
  }

  async approveTimeRecord(id: string, approvedBy: string) {
    const record = await this.findTimeRecord(id);

    if (record.approved) {
      throw new BadRequestException('Este registro já está aprovado');
    }

    if (!record.checkInTime || !record.checkOutTime) {
      throw new BadRequestException(
        'Não é possível aprovar um registro incompleto',
      );
    }

    const [approved] = await this.db
      .update(tbEmployeeTimeRecords)
      .set({
        approved: true,
        approvedBy,
        updatedAt: new Date(),
      })
      .where(eq(tbEmployeeTimeRecords.id, id))
      .returning();

    return approved;
  }

  async deleteTimeRecord(id: string) {
    const record = await this.findTimeRecord(id);

    if (record.approved) {
      throw new BadRequestException(
        'Não é possível excluir um registro de ponto aprovado',
      );
    }

    await this.db
      .delete(tbEmployeeTimeRecords)
      .where(eq(tbEmployeeTimeRecords.id, id));

    return { message: 'Registro excluído com sucesso' };
  }

  // ==================== RELATÓRIOS ====================

  async getEmployeeReport(employeeId: string, month: number, year: number) {
    const employee = await this.findOne(employeeId);

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const records = await this.db
      .select()
      .from(tbEmployeeTimeRecords)
      .where(
        and(
          eq(tbEmployeeTimeRecords.employeeId, employeeId),
          gte(tbEmployeeTimeRecords.date, startDate),
          lte(tbEmployeeTimeRecords.date, endDate),
        ),
      )
      .orderBy(tbEmployeeTimeRecords.date);

    // Calcula totais
    let totalMinutes = 0;
    let daysWorked = 0;
    let pendingApproval = 0;

    for (const record of records) {
      if (record.totalHours) {
        const [hours, minutes] = record.totalHours.split(':').map(Number);
        totalMinutes += hours * 60 + minutes;
        daysWorked++;
      }
      if (!record.approved) {
        pendingApproval++;
      }
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = totalMinutes % 60;

    return {
      employee,
      period: { month, year },
      summary: {
        daysWorked,
        pendingApproval,
        totalHours: `${totalHours}:${String(totalRemainingMinutes).padStart(2, '0')}`,
        totalMinutes,
      },
      records,
    };
  }

  // ==================== HELPERS ====================

  private calculateTotalHours(checkIn: string, checkOut: string): string {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);

    let totalMinutes = outHour * 60 + outMin - (inHour * 60 + inMin);

    // Se o checkout for antes do checkin, assume que passou da meia-noite
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}
