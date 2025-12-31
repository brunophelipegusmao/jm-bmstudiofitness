import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, isNull, lte, sql } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../database/schema';

import {
  tbCheckIns,
  tbUsers,
  tbPersonalData,
  UserRole,
} from '../database/schema';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { EmployeeCheckInDto } from './dto/employee-check-in.dto';
import { QueryCheckInsDto } from './dto/query-check-ins.dto';

@Injectable()
export class CheckInsService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /**
   * Realizar check-in
   */
  async create(createCheckInDto: CreateCheckInDto, requestingUserId: string) {
    // Verificar se usuário existe e está ativo
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(
        and(
          eq(tbUsers.id, createCheckInDto.userId),
          isNull(tbUsers.deletedAt),
          eq(tbUsers.isActive, true),
        ),
      )
      .limit(1);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado ou inativo');
    }

    // Definir quem fez o check-in
    let checkedInBy: string | undefined = undefined;
    if (createCheckInDto.userId !== requestingUserId) {
      // Check-in feito por funcionário/coach
      checkedInBy = requestingUserId;
    }

    const now = new Date();
    const checkInDate =
      createCheckInDto.checkInDate || now.toISOString().split('T')[0];
    const checkInTime =
      createCheckInDto.checkInTime ||
      now.toTimeString().split(' ')[0].substring(0, 5);

    const insertData = {
      userId: createCheckInDto.userId,
      checkInDate,
      checkInTime,
      method: createCheckInDto.method,
      ...(createCheckInDto.identifier && {
        identifier: createCheckInDto.identifier,
      }),
      ...(checkedInBy || createCheckInDto.checkedInBy
        ? { checkedInBy: checkedInBy || createCheckInDto.checkedInBy }
        : {}),
    } as typeof tbCheckIns.$inferInsert;

    const [checkIn] = await this.db
      .insert(tbCheckIns)
      .values(insertData)
      .returning();

    return checkIn;
  }

  /**
   * Check-in via identificador (CPF ou email) feito por funcionário/coach
   */
  async employeeCheckIn(dto: EmployeeCheckInDto, requestingUserId: string) {
    const identifier = dto.identifier.trim();
    const method = dto.method || 'manual';

    const isCpf = /^\d{11}$/.test(identifier);

    const [personal] = await this.db
      .select({
        userId: tbPersonalData.userId,
        email: tbPersonalData.email,
        cpf: tbPersonalData.cpf,
      })
      .from(tbPersonalData)
      .where(
        isCpf
          ? eq(tbPersonalData.cpf, identifier)
          : eq(tbPersonalData.email, identifier),
      )
      .limit(1);

    if (!personal) {
      throw new NotFoundException('Aluno não encontrado');
    }

    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, personal.userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Aluno não encontrado ou inativo');
    }

    const checkIn = await this.create(
      {
        userId: personal.userId,
        method,
        identifier,
        checkedInBy: requestingUserId,
      },
      requestingUserId,
    );

    return {
      success: true,
      message: 'Check-in realizado com sucesso',
      studentName: user.name,
      checkIn,
    };
  }

  /**
   * Listar check-ins com filtros
   */
  async findAll(
    queryDto: QueryCheckInsDto,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    const {
      userId,
      startDate,
      endDate,
      method,
      page = 1,
      limit = 10,
    } = queryDto;
    const offset = (page - 1) * limit;

    // Se for aluno, só pode ver próprios check-ins
    const targetUserId =
      userRole === UserRole.ALUNO ? requestingUserId : userId;

    // Construir condições
    const conditions: SQLWrapper[] = [];
    if (targetUserId) {
      conditions.push(eq(tbCheckIns.userId, targetUserId));
    }
    if (startDate) {
      conditions.push(gte(tbCheckIns.checkInDate, startDate));
    }
    if (endDate) {
      conditions.push(lte(tbCheckIns.checkInDate, endDate));
    }
    if (method) {
      conditions.push(eq(tbCheckIns.method, method));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Query principal com joins
    const checkIns = await this.db
      .select({
        id: tbCheckIns.id,
        userId: tbCheckIns.userId,
        checkInDate: tbCheckIns.checkInDate,
        checkInTime: tbCheckIns.checkInTime,
        method: tbCheckIns.method,
        identifier: tbCheckIns.identifier,
        checkedInBy: tbCheckIns.checkedInBy,
        createdAt: tbCheckIns.createdAt,
        userName: tbUsers.name,
      })
      .from(tbCheckIns)
      .leftJoin(tbUsers, eq(tbCheckIns.userId, tbUsers.id))
      .where(whereClause)
      .orderBy(desc(tbCheckIns.checkInDate), desc(tbCheckIns.checkInTime))
      .limit(limit)
      .offset(offset);

    // Contar total
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tbCheckIns)
      .where(whereClause);

    return {
      data: checkIns,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  /**
   * Check-ins de hoje
   */
  async getTodayCheckIns() {
    const today = new Date().toISOString().split('T')[0];

    const checkIns = await this.db
      .select({
        id: tbCheckIns.id,
        userId: tbCheckIns.userId,
        checkInDate: tbCheckIns.checkInDate,
        checkInTime: tbCheckIns.checkInTime,
        method: tbCheckIns.method,
        userName: tbUsers.name,
        userRole: tbUsers.userRole,
      })
      .from(tbCheckIns)
      .leftJoin(tbUsers, eq(tbCheckIns.userId, tbUsers.id))
      .where(eq(tbCheckIns.checkInDate, today))
      .orderBy(desc(tbCheckIns.checkInTime));

    return checkIns;
  }

  /**
   * Check-ins do prÇüprio usuÇ­rio (para dashboard do aluno)
   */
  async getStudentCheckIns(userId: string, userRole: UserRole) {
    // Aluno sÇü pode ver prÇüprio histÇürico; outros roles podem ver qualquer aluno (usando o prÇüprio ID aqui)
    const targetUserId = userId;
    if (userRole === UserRole.ALUNO && !targetUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    const checkIns = await this.db
      .select({
        id: tbCheckIns.id,
        userId: tbCheckIns.userId,
        checkInDate: tbCheckIns.checkInDate,
        checkInTime: tbCheckIns.checkInTime,
        method: tbCheckIns.method,
        identifier: tbCheckIns.identifier,
        checkedInBy: tbCheckIns.checkedInBy,
        createdAt: tbCheckIns.createdAt,
      })
      .from(tbCheckIns)
      .where(eq(tbCheckIns.userId, targetUserId))
      .orderBy(desc(tbCheckIns.checkInDate), desc(tbCheckIns.checkInTime));

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const stats = {
      totalCheckIns: checkIns.length,
      thisMonth: checkIns.filter((c) => {
        const d = new Date(`${c.checkInDate}T${c.checkInTime}:00`);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length,
      thisWeek: checkIns.filter((c) => {
        const d = new Date(`${c.checkInDate}T${c.checkInTime}:00`);
        return d >= oneWeekAgo;
      }).length,
      lastCheckIn: checkIns[0]?.checkInDate ?? null,
    };

    const mapped = checkIns.map((c) => ({
      ...c,
      checkInTimestamp: `${c.checkInDate}T${c.checkInTime}:00`,
    }));

    return {
      success: true,
      message: '',
      checkIns: mapped,
      stats,
    };
  }

  /**
   * Buscar check-in por ID
   */
  async findOne(id: string, requestingUserId: string, userRole: UserRole) {
    const [checkIn] = await this.db
      .select({
        id: tbCheckIns.id,
        userId: tbCheckIns.userId,
        checkInDate: tbCheckIns.checkInDate,
        checkInTime: tbCheckIns.checkInTime,
        method: tbCheckIns.method,
        identifier: tbCheckIns.identifier,
        checkedInBy: tbCheckIns.checkedInBy,
        createdAt: tbCheckIns.createdAt,
        userName: tbUsers.name,
      })
      .from(tbCheckIns)
      .leftJoin(tbUsers, eq(tbCheckIns.userId, tbUsers.id))
      .where(eq(tbCheckIns.id, id))
      .limit(1);

    if (!checkIn) {
      throw new NotFoundException('Check-in não encontrado');
    }

    // Aluno só pode ver próprios check-ins
    if (userRole === UserRole.ALUNO && checkIn.userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    return checkIn;
  }

  /**
   * Histórico de check-ins de um usuário
   */
  async getUserHistory(
    userId: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    // Aluno só pode ver próprio histórico
    if (userRole === UserRole.ALUNO && userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    const checkIns = await this.db
      .select()
      .from(tbCheckIns)
      .where(eq(tbCheckIns.userId, userId))
      .orderBy(desc(tbCheckIns.checkInDate), desc(tbCheckIns.checkInTime));

    return checkIns;
  }

  /**
   * Estatísticas de check-ins de um usuário
   */
  async getUserStats(
    userId: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    // Aluno só pode ver próprias estatísticas
    if (userRole === UserRole.ALUNO && userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [stats] = await this.db
      .select({
        totalCheckIns: sql<number>`count(*)`,
        last30Days: sql<number>`count(*) filter (where ${tbCheckIns.checkInDate} >= ${thirtyDaysAgoStr})`,
        lastCheckIn: sql<string>`max(${tbCheckIns.checkInDate})`,
      })
      .from(tbCheckIns)
      .where(eq(tbCheckIns.userId, userId));

    return stats;
  }

  /**
   * Deletar check-in (apenas MASTER)
   */
  async remove(id: string) {
    const [existing] = await this.db
      .select()
      .from(tbCheckIns)
      .where(eq(tbCheckIns.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Check-in não encontrado');
    }

    await this.db.delete(tbCheckIns).where(eq(tbCheckIns.id, id));

    return { message: 'Check-in deletado com sucesso' };
  }
}
