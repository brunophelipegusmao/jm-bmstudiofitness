import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, isNull, like, or, sql } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../database/schema';

import {
  tbFinancial,
  tbHealthMetrics,
  tbPersonalData,
  tbStudentPermissions,
  tbUsers,
  UserRole,
} from '../database/schema';
import { CreateHealthMetricsDto } from './dto/create-health-metrics.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateHealthMetricsDto } from './dto/update-health-metrics.dto';

@Injectable()
export class StudentsService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /**
   * Listar alunos (COACH, ADMIN, MASTER)
   */
  async findAll(queryDto: QueryStudentsDto) {
    const { search, page = 1, limit = 10 } = queryDto;
    const offset = (page - 1) * limit;

    // Construir condições
    const conditions: SQLWrapper[] = [
      isNull(tbUsers.deletedAt),
      eq(tbUsers.userRole, UserRole.ALUNO),
    ];

    if (search) {
      const searchCondition = or(
        like(tbUsers.name, `%${search}%`),
        like(tbPersonalData.email, `%${search}%`),
      ) as SQLWrapper;
      conditions.push(searchCondition);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Query principal
    const students = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        email: tbPersonalData.email,
        telephone: tbPersonalData.telephone,
        cpf: tbPersonalData.cpf,
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(whereClause)
      .orderBy(desc(tbUsers.createdAt))
      .limit(limit)
      .offset(offset);

    // Contar total
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(whereClause);

    return {
      data: students,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  /**
   * Dados completos para o dashboard do aluno (inclusive para roles elevadas)
   */
  async getDashboardData(userId: string, userRole: UserRole) {
    // Se for aluno, garante que estÇ­ pegando prÇüprio ID
    if (userRole === UserRole.ALUNO && !userId) {
      throw new ForbiddenException('Acesso negado');
    }

    const [user] = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        personalData: {
          email: tbPersonalData.email,
          cpf: tbPersonalData.cpf,
          bornDate: tbPersonalData.bornDate,
          address: tbPersonalData.address,
          telephone: tbPersonalData.telephone,
        },
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(and(eq(tbUsers.id, userId), isNull(tbUsers.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundException('UsuÇ­rio nÇœo encontrado');
    }

    const [health] = await this.db
      .select({
        heightCm: tbHealthMetrics.heightCm,
        weightKg: tbHealthMetrics.weightKg,
        bloodType: tbHealthMetrics.bloodType,
        updatedAt: tbHealthMetrics.updatedAt,
      })
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, userId))
      .limit(1);

    const [financial] = await this.db
      .select({
        paid: tbFinancial.paid,
        monthlyFeeValueInCents: tbFinancial.monthlyFeeValue,
        dueDate: tbFinancial.dueDate,
        lastPaymentDate: tbFinancial.lastPaymentDate,
      })
      .from(tbFinancial)
      .where(eq(tbFinancial.userId, userId))
      .orderBy(desc(tbFinancial.createdAt))
      .limit(1);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
        },
        personalData: {
          email: user.personalData.email ?? '',
          cpf: user.personalData.cpf ?? '',
          bornDate: user.personalData.bornDate ?? '1970-01-01',
          address: user.personalData.address ?? '',
          telephone: user.personalData.telephone ?? '',
        },
        healthMetrics: {
          heightCm: health?.heightCm ?? 0,
          weightKg: health?.weightKg ?? 0,
          bloodType: health?.bloodType ?? '',
          updatedAt:
            (health?.updatedAt as string | null) ??
            new Date().toISOString(),
        },
        financial: {
          paid: financial?.paid ?? false,
          monthlyFeeValueInCents: financial?.monthlyFeeValueInCents ?? 0,
          dueDate: financial?.dueDate ?? 0,
          lastPaymentDate: (financial?.lastPaymentDate as string | null) ?? null,
        },
      },
      message: '',
    };
  }

  /**
   * Buscar dados completos do aluno
   */
  async findOne(id: string, requestingUserId: string, userRole: UserRole) {
    // Aluno só pode ver próprios dados
    if (userRole === UserRole.ALUNO && id !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    const [student] = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        personalData: {
          email: tbPersonalData.email,
          cpf: tbPersonalData.cpf,
          bornDate: tbPersonalData.bornDate,
          address: tbPersonalData.address,
          telephone: tbPersonalData.telephone,
        },
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(and(eq(tbUsers.id, id), isNull(tbUsers.deletedAt)))
      .limit(1);

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return student;
  }

  /**
   * Buscar métricas de saúde do aluno
   */
  async getHealthMetrics(
    userId: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    // Aluno só pode ver próprias métricas
    if (userRole === UserRole.ALUNO && userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    const [metrics] = await this.db
      .select()
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, userId))
      .limit(1);

    // Se não existe, retornar objeto vazio
    if (!metrics) {
      return {
        userId,
        message: 'Nenhuma métrica cadastrada ainda',
      };
    }

    // Aluno não pode ver anotações particulares dos coaches
    if (userRole === UserRole.ALUNO) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { coachObservationsParticular, ...metricsWithoutPrivate } = metrics;
      return metricsWithoutPrivate;
    }

    return metrics;
  }

  /**
   * Criar métricas de saúde
   */
  async createHealthMetrics(createHealthMetricsDto: CreateHealthMetricsDto) {
    // Verificar se usuário existe e é aluno
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(
        and(
          eq(tbUsers.id, createHealthMetricsDto.userId),
          eq(tbUsers.userRole, UserRole.ALUNO),
        ),
      )
      .limit(1);

    if (!user) {
      throw new NotFoundException('Aluno não encontrado');
    }

    // Verificar se já existe métrica
    const [existing] = await this.db
      .select()
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, createHealthMetricsDto.userId))
      .limit(1);

    if (existing) {
      throw new BadRequestException(
        'Métricas já existem para este aluno. Use PATCH para atualizar.',
      );
    }

    const insertData: any = { userId: createHealthMetricsDto.userId };

    if (createHealthMetricsDto.heightCm)
      insertData.heightCm = createHealthMetricsDto.heightCm;
    if (createHealthMetricsDto.weightKg)
      insertData.weightKg = createHealthMetricsDto.weightKg;
    if (createHealthMetricsDto.bloodType)
      insertData.bloodType = createHealthMetricsDto.bloodType;
    if (createHealthMetricsDto.hasPracticedSports !== undefined)
      insertData.hasPracticedSports = createHealthMetricsDto.hasPracticedSports;
    if (createHealthMetricsDto.lastExercise)
      insertData.lastExercise = createHealthMetricsDto.lastExercise;
    if (createHealthMetricsDto.historyDiseases)
      insertData.historyDiseases = createHealthMetricsDto.historyDiseases;
    if (createHealthMetricsDto.medications)
      insertData.medications = createHealthMetricsDto.medications;
    if (createHealthMetricsDto.sportsHistory)
      insertData.sportsHistory = createHealthMetricsDto.sportsHistory;
    if (createHealthMetricsDto.allergies)
      insertData.allergies = createHealthMetricsDto.allergies;
    if (createHealthMetricsDto.injuries)
      insertData.injuries = createHealthMetricsDto.injuries;
    if (createHealthMetricsDto.alimentalRoutine)
      insertData.alimentalRoutine = createHealthMetricsDto.alimentalRoutine;
    if (createHealthMetricsDto.diaryRoutine)
      insertData.diaryRoutine = createHealthMetricsDto.diaryRoutine;
    if (createHealthMetricsDto.useSupplements !== undefined)
      insertData.useSupplements = createHealthMetricsDto.useSupplements;
    if (createHealthMetricsDto.whatSupplements)
      insertData.whatSupplements = createHealthMetricsDto.whatSupplements;
    if (createHealthMetricsDto.otherNotes)
      insertData.otherNotes = createHealthMetricsDto.otherNotes;
    if (createHealthMetricsDto.coachObservations)
      insertData.coachObservations = createHealthMetricsDto.coachObservations;
    if (createHealthMetricsDto.coachObservationsParticular)
      insertData.coachObservationsParticular =
        createHealthMetricsDto.coachObservationsParticular;

    const [metrics] = await this.db
      .insert(tbHealthMetrics)
      .values(insertData)
      .returning();

    return metrics;
  }

  /**
   * Atualizar métricas de saúde
   */
  async updateHealthMetrics(
    userId: string,
    updateHealthMetricsDto: UpdateHealthMetricsDto,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    // Buscar permissões se for aluno tentando editar
    if (userRole === UserRole.ALUNO && userId === requestingUserId) {
      const [permissions] = await this.db
        .select()
        .from(tbStudentPermissions)
        .where(eq(tbStudentPermissions.userId, userId))
        .limit(1);

      // Verificar cada campo que o aluno está tentando editar
      const updates: any = {};

      if (updateHealthMetricsDto.heightCm !== undefined) {
        if (!permissions?.canEditHeight) {
          throw new ForbiddenException(
            'Você não tem permissão para editar altura',
          );
        }
        updates.heightCm = updateHealthMetricsDto.heightCm;
      }

      if (updateHealthMetricsDto.weightKg !== undefined) {
        if (!permissions?.canEditWeight) {
          throw new ForbiddenException(
            'Você não tem permissão para editar peso',
          );
        }
        updates.weightKg = updateHealthMetricsDto.weightKg;
      }

      if (updateHealthMetricsDto.bloodType !== undefined) {
        if (!permissions?.canEditBloodType) {
          throw new ForbiddenException(
            'Você não tem permissão para editar tipo sanguíneo',
          );
        }
        updates.bloodType = updateHealthMetricsDto.bloodType;
      }

      if (updateHealthMetricsDto.medications !== undefined) {
        if (!permissions?.canEditMedications) {
          throw new ForbiddenException(
            'Você não tem permissão para editar medicações',
          );
        }
        updates.medications = updateHealthMetricsDto.medications;
      }

      if (updateHealthMetricsDto.allergies !== undefined) {
        if (!permissions?.canEditAllergies) {
          throw new ForbiddenException(
            'Você não tem permissão para editar alergias',
          );
        }
        updates.allergies = updateHealthMetricsDto.allergies;
      }

      if (updateHealthMetricsDto.injuries !== undefined) {
        if (!permissions?.canEditInjuries) {
          throw new ForbiddenException(
            'Você não tem permissão para editar lesões',
          );
        }
        updates.injuries = updateHealthMetricsDto.injuries;
      }

      if (
        updateHealthMetricsDto.alimentalRoutine !== undefined ||
        updateHealthMetricsDto.diaryRoutine !== undefined
      ) {
        if (!permissions?.canEditRoutine) {
          throw new ForbiddenException(
            'Você não tem permissão para editar rotina',
          );
        }
        if (updateHealthMetricsDto.alimentalRoutine)
          updates.alimentalRoutine = updateHealthMetricsDto.alimentalRoutine;
        if (updateHealthMetricsDto.diaryRoutine)
          updates.diaryRoutine = updateHealthMetricsDto.diaryRoutine;
      }

      if (
        updateHealthMetricsDto.useSupplements !== undefined ||
        updateHealthMetricsDto.whatSupplements !== undefined
      ) {
        if (!permissions?.canEditSupplements) {
          throw new ForbiddenException(
            'Você não tem permissão para editar suplementos',
          );
        }
        if (updateHealthMetricsDto.useSupplements !== undefined)
          updates.useSupplements = updateHealthMetricsDto.useSupplements;
        if (updateHealthMetricsDto.whatSupplements)
          updates.whatSupplements = updateHealthMetricsDto.whatSupplements;
      }

      // Aluno não pode editar anotações de coach
      if (
        updateHealthMetricsDto.coachObservations ||
        updateHealthMetricsDto.coachObservationsParticular
      ) {
        throw new ForbiddenException(
          'Você não pode editar anotações de coaches',
        );
      }

      // Outros campos permitidos para aluno
      if (updateHealthMetricsDto.hasPracticedSports !== undefined)
        updates.hasPracticedSports = updateHealthMetricsDto.hasPracticedSports;
      if (updateHealthMetricsDto.lastExercise)
        updates.lastExercise = updateHealthMetricsDto.lastExercise;
      if (updateHealthMetricsDto.historyDiseases)
        updates.historyDiseases = updateHealthMetricsDto.historyDiseases;
      if (updateHealthMetricsDto.sportsHistory)
        updates.sportsHistory = updateHealthMetricsDto.sportsHistory;
      if (updateHealthMetricsDto.otherNotes)
        updates.otherNotes = updateHealthMetricsDto.otherNotes;

      updates.updatedAt = new Date().toISOString();

      const [updated] = await this.db
        .update(tbHealthMetrics)
        .set(updates)
        .where(eq(tbHealthMetrics.userId, userId))
        .returning();

      return updated;
    }

    // Coach/Admin/Master pode editar tudo
    const [updated] = await this.db
      .update(tbHealthMetrics)
      .set({
        ...updateHealthMetricsDto,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tbHealthMetrics.userId, userId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Métricas de saúde não encontradas');
    }

    return updated;
  }

  /**
   * Adicionar observação de coach (apenas COACH, ADMIN, MASTER)
   */
  async addCoachObservation(
    userId: string,
    observation: string,
    isPrivate: boolean = false,
  ) {
    const field = isPrivate
      ? 'coachObservationsParticular'
      : 'coachObservations';

    const [existing] = await this.db
      .select()
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, userId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException(
        'Métricas de saúde não encontradas. Crie as métricas primeiro.',
      );
    }

    const currentObservation = existing[field] || '';
    const timestamp = new Date().toISOString();
    const newObservation = currentObservation
      ? `${currentObservation}\n\n[${timestamp}] ${observation}`
      : `[${timestamp}] ${observation}`;

    const [updated] = await this.db
      .update(tbHealthMetrics)
      .set({
        [field]: newObservation,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tbHealthMetrics.userId, userId))
      .returning();

    return updated;
  }
}
