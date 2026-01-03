import {
  BadRequestException,
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
   * Realizar check-in (publico ou autenticado)
   */
  async create(
    createCheckInDto: CreateCheckInDto,
    requestingUserId?: string,
  ) {
    let targetUserId = createCheckInDto.userId;
    let resolvedMethod = createCheckInDto.method;
    let resolvedIdentifier = createCheckInDto.identifier?.trim();

    // Resolver usuario via CPF/email quando userId nao vier
    if (!targetUserId) {
      if (!resolvedIdentifier) {
        throw new BadRequestException(
          'Informe o CPF ou email do aluno para check-in',
        );
      }

      const isCpf = /^\d{11}$/.test(resolvedIdentifier);
      const [personal] = await this.db
        .select({
          userId: tbPersonalData.userId,
          email: tbPersonalData.email,
          cpf: tbPersonalData.cpf,
        })
        .from(tbPersonalData)
        .where(
          isCpf
            ? eq(tbPersonalData.cpf, resolvedIdentifier)
            : eq(tbPersonalData.email, resolvedIdentifier),
        )
        .limit(1);

      if (!personal) {
        throw new NotFoundException('Aluno nao encontrado');
      }

      targetUserId = personal.userId;
      resolvedMethod = resolvedMethod ?? (isCpf ? 'cpf' : 'email');
    }

    // Buscar dados do usuario
    const [user] = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        isActive: tbUsers.isActive,
        deletedAt: tbUsers.deletedAt,
      })
      .from(tbUsers)
      .where(eq(tbUsers.id, targetUserId!))
      .limit(1);

    if (!user || user.deletedAt || !user.isActive) {
      throw new NotFoundException('Usuario nao encontrado ou inativo');
    }

    // Pegar dados pessoais para fallback de identificador
    if (!resolvedIdentifier) {
      const [personal] = await this.db
        .select({
          email: tbPersonalData.email,
          cpf: tbPersonalData.cpf,
        })
        .from(tbPersonalData)
        .where(eq(tbPersonalData.userId, targetUserId!))
        .limit(1);
      resolvedIdentifier = personal?.cpf ?? personal?.email ?? 'manual';
    }

    let checkedInBy: string | undefined = undefined;
    if (requestingUserId && requestingUserId !== targetUserId) {
      checkedInBy = requestingUserId;
    }

    const now = new Date();
    const checkInDate =
      createCheckInDto.checkInDate || now.toISOString().split('T')[0];
    const checkInTime =
      createCheckInDto.checkInTime ||
      now.toTimeString().split(' ')[0].substring(0, 5);

    const [checkIn] = await this.db
      .insert(tbCheckIns)
      .values({
        userId: targetUserId!,
        checkInDate,
        checkInTime,
        method: resolvedMethod ?? 'manual',
        identifier: resolvedIdentifier,
        ...(checkedInBy ? { checkedInBy } : {}),
      })
      .returning();

    return {
      success: true,
      message: 'Check-in registrado com sucesso',
      userName: user.name,
      checkIn,
    };
  }

  /**
   * Check-in via identificador (CPF ou email) feito por funcionario/coach
   */
  async employeeCheckIn(dto: EmployeeCheckInDto, requestingUserId: string) {
    let targetUserId: string | undefined;
    let resolvedIdentifier = dto.identifier?.trim();
    let resolvedMethod = dto.method || 'manual';

    if (resolvedIdentifier) {
      const isCpf = /^\d{11}$/.test(resolvedIdentifier);

      const [personal] = await this.db
        .select({
          userId: tbPersonalData.userId,
          email: tbPersonalData.email,
          cpf: tbPersonalData.cpf,
        })
        .from(tbPersonalData)
        .where(
          isCpf
            ? eq(tbPersonalData.cpf, resolvedIdentifier)
            : eq(tbPersonalData.email, resolvedIdentifier),
        )
        .limit(1);

      if (!personal) {
        throw new NotFoundException('Aluno nao encontrado');
      }

      targetUserId = personal.userId;
      resolvedMethod = dto.method ?? (isCpf ? 'cpf' : 'email');
    } else {
      // Sem identificador: assume check-in do proprio funcionario/coach
      targetUserId = requestingUserId;
      const [personal] = await this.db
        .select({ email: tbPersonalData.email, cpf: tbPersonalData.cpf })
        .from(tbPersonalData)
        .where(eq(tbPersonalData.userId, targetUserId))
        .limit(1);
      resolvedIdentifier = personal?.cpf ?? personal?.email ?? 'manual';
      resolvedMethod = dto.method ?? 'manual';
    }

    if (!targetUserId) {
      throw new BadRequestException('Nenhum usuario alvo encontrado');
    }

    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, targetUserId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Aluno nao encontrado ou inativo');
    }

    const created = await this.create(
      {
        userId: targetUserId,
        method: resolvedMethod,
        identifier: resolvedIdentifier,
        checkedInBy: requestingUserId,
      },
      requestingUserId,
    );

    return {
      success: true,
      message: 'Check-in realizado com sucesso',
      studentName: user.name,
      checkIn: created.checkIn,
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

    const targetUserId =
      userRole === UserRole.ALUNO ? requestingUserId : userId;

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
   * Check-ins do proprio usuario (para dashboard do aluno)
   */
  async getStudentCheckIns(userId: string, userRole: UserRole) {
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
      throw new NotFoundException('Check-in nao encontrado');
    }

    if (userRole === UserRole.ALUNO && checkIn.userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    return checkIn;
  }

  /**
   * Historico de check-ins de um usuario
   */
  async getUserHistory(
    userId: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
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
   * Estatisticas de check-ins de um usuario
   */
  async getUserStats(
    userId: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
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
      throw new NotFoundException('Check-in nao encontrado');
    }

    await this.db.delete(tbCheckIns).where(eq(tbCheckIns.id, id));

    return { message: 'Check-in deletado com sucesso' };
  }
}
