import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, isNull,lte, sql } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { tbCheckIns, tbUsers, UserRole } from '../database/schema';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { QueryCheckInsDto } from './dto/query-check-ins.dto';

@Injectable()
export class CheckInsService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<any>,
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
    const conditions: any[] = [];
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

    const whereClause =
      conditions.length > 0 ? and(...(conditions as any[])) : undefined;

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
