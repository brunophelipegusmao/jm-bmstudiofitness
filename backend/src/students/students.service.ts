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
  tbBlogPosts,
  tbPersonalData,
  tbStudentPermissions,
  tbCheckIns,
  tbPersonalEvents,
  tbUsers,
  UserRole,
} from '../database/schema';
import { CreateHealthMetricsDto } from './dto/create-health-metrics.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateHealthMetricsDto } from './dto/update-health-metrics.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreatePersonalEventDto } from './dto/personal-event.dto';

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

    // Construir condies
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
        sex: tbPersonalData.sex,
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
    // Se for aluno, garante que est pegando prprio ID
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
          sex: tbPersonalData.sex,
          telephone: tbPersonalData.telephone,
        },
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(and(eq(tbUsers.id, userId), isNull(tbUsers.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Usurio no encontrado');
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
        id: tbFinancial.id,
        paid: tbFinancial.paid,
        monthlyFeeValueInCents: tbFinancial.monthlyFeeValue,
        dueDate: tbFinancial.dueDate,
        paymentMethod: tbFinancial.paymentMethod,
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
          email: user.personalData?.email ?? '',
          cpf: user.personalData?.cpf ?? '',
          bornDate: user.personalData?.bornDate ?? '1970-01-01',
          address: user.personalData?.address ?? '',
          sex: user.personalData?.sex ?? 'masculino',
          telephone: user.personalData?.telephone ?? '',
        },
        healthMetrics: {
          heightCm: health?.heightCm ?? 0,
          weightKg: health?.weightKg ?? 0,
          bloodType: health?.bloodType ?? '',
          updatedAt:
            (health?.updatedAt as string | null) ?? new Date().toISOString(),
        },
        financial: {
          id: financial?.id ?? null,
          paid: financial?.paid ?? false,
          monthlyFeeValueInCents: financial?.monthlyFeeValueInCents ?? 0,
          dueDate: financial?.dueDate ?? 0,
          paymentMethod: financial?.paymentMethod ?? null,
          lastPaymentDate: financial?.lastPaymentDate ?? null,
        },
      },
      message: '',
    };
  }

  /**
   * Buscar dados completos do aluno
   */
  async findOne(id: string, requestingUserId: string, userRole: UserRole) {
    // Aluno s pode ver prprios dados
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
          sex: tbPersonalData.sex,
          telephone: tbPersonalData.telephone,
        },
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(and(eq(tbUsers.id, id), isNull(tbUsers.deletedAt)))
      .limit(1);

    if (!student) {
      throw new NotFoundException('Aluno no encontrado');
    }

    return student;
  }

  /**
   * Buscar mtricas de sade do aluno
   */
  async getHealthMetrics(
    userId: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    // Aluno s pode ver prprias mtricas
    if (userRole === UserRole.ALUNO && userId !== requestingUserId) {
      throw new ForbiddenException('Acesso negado');
    }

    const [metrics] = await this.db
      .select()
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, userId))
      .limit(1);

    // Se no existe, retornar objeto vazio
    if (!metrics) {
      return {
        userId,
        message: 'Nenhuma mtrica cadastrada ainda',
      };
    }

    // Aluno no pode ver anotaes particulares dos coaches
    if (userRole === UserRole.ALUNO) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { coachObservationsParticular, ...metricsWithoutPrivate } = metrics;
      return metricsWithoutPrivate;
    }

    return metrics;
  }
  /**
   * Historico de saude do proprio aluno
   */
  async getHealthHistory(userId: string, userRole: UserRole) {
    if (userRole === UserRole.ALUNO && !userId) {
      throw new ForbiddenException('Acesso negado');
    }

    const [metrics] = await this.db
      .select()
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, userId))
      .limit(1);

    if (!metrics) {
      return {
        success: true,
        message: 'Nenhum dado de saude encontrado',
        history: [],
        currentHealth: null,
      };
    }

    const historyEntry = {
      id: metrics.id,
      heightCm: metrics.heightCm ? Number(metrics.heightCm) : null,
      weightKg: metrics.weightKg ?? null,
      notes: metrics.otherNotes ?? null,
      updatedAt: metrics.updatedAt,
      createdAt: metrics.updatedAt,
    };

    return {
      success: true,
      message: '',
      history: [historyEntry],
      currentHealth: {
        heightCm: metrics.heightCm ? Number(metrics.heightCm) : 0,
        weightKg: metrics.weightKg ? Number(metrics.weightKg) : 0,
        bloodType: metrics.bloodType ?? '',
        updatedAt: metrics.updatedAt,
      },
    };
  }

  /**
   * Eventos pessoais do aluno
   */
  async listPersonalEvents(userId: string) {
    const events = await this.db
      .select()
      .from(tbPersonalEvents)
      .where(and(eq(tbPersonalEvents.userId, userId)))
      .orderBy(desc(tbPersonalEvents.eventDate));

    return events;
  }

  async createPersonalEvent(userId: string, dto: CreatePersonalEventDto) {
    const [event] = await this.db
      .insert(tbPersonalEvents)
      .values({
        userId,
        title: dto.title,
        description: dto.description,
        eventDate: dto.date,
        eventTime: dto.time,
        location: dto.location,
        hideLocation: dto.hideLocation ?? false,
        requestPublic: dto.requestPublic ?? false,
        approvalStatus: dto.requestPublic ? 'pending' : 'private',
        isPublic: false,
      })
      .returning();

    return event;
  }

  async requestPublicEvent(userId: string, id: string) {
    const [event] = await this.db
      .select()
      .from(tbPersonalEvents)
      .where(
        and(eq(tbPersonalEvents.id, id), eq(tbPersonalEvents.userId, userId)),
      )
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento pessoal nao encontrado');
    }

    const [updated] = await this.db
      .update(tbPersonalEvents)
      .set({
        requestPublic: true,
        approvalStatus: 'pending',
        updatedAt: new Date(),
      })
      .where(eq(tbPersonalEvents.id, id))
      .returning();

    return updated;
  }

  async approvePersonalEvent(id: string, approve: boolean) {
    const [event] = await this.db
      .select()
      .from(tbPersonalEvents)
      .where(eq(tbPersonalEvents.id, id))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento pessoal nao encontrado');
    }

    const status = approve ? 'approved' : 'rejected';
    const isPublic = approve;

    // Se aprovado, garantir que exista evento publico correspondente
    if (approve) {
      const slug = `personal-${event.id}`;
      const [existingPublished] = await this.db
        .select()
        .from(tbBlogPosts)
        .where(eq(tbBlogPosts.slug, slug))
        .limit(1);

      if (!existingPublished) {
        await this.db.insert(tbBlogPosts).values({
          title: event.title,
          slug,
          excerpt: event.description?.slice(0, 140) ?? event.description,
          content: event.description,
          eventDate:
            typeof event.eventDate === 'string'
              ? event.eventDate
              : ((event.eventDate as Date | null)?.toISOString().slice(0, 10) ??
                new Date().toISOString().slice(0, 10)),
          eventTime: event.eventTime || null,
          location: event.location || null,
          hideLocation: event.hideLocation ?? false,
          requireAttendance: false,
          authorId: event.userId,
          isPublished: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          coverImage: null,
          metaTitle: event.title,
          metaDescription:
            event.description?.slice(0, 160) ?? event.description,
        });
      }
    }

    const [updated] = await this.db
      .update(tbPersonalEvents)
      .set({
        approvalStatus: status,
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(tbPersonalEvents.id, id))
      .returning();

    return updated;
  }

  /**
   * Lista todas as solicitacoes de eventos pessoais pendentes ou privados (para admins/funcionarios)
   */
  async listAllPendingPersonalEvents() {
    const events = await this.db
      .select({
        id: tbPersonalEvents.id,
        title: tbPersonalEvents.title,
        description: tbPersonalEvents.description,
        eventDate: tbPersonalEvents.eventDate,
        eventTime: tbPersonalEvents.eventTime,
        userId: tbPersonalEvents.userId,
        approvalStatus: tbPersonalEvents.approvalStatus,
        requestPublic: tbPersonalEvents.requestPublic,
        isPublic: tbPersonalEvents.isPublic,
        userName: tbUsers.name,
      })
      .from(tbPersonalEvents)
      .leftJoin(tbUsers, eq(tbPersonalEvents.userId, tbUsers.id))
      .where(
        and(
          eq(tbPersonalEvents.isPublic, false),
          or(
            eq(tbPersonalEvents.approvalStatus, sql`'pending'`),
            eq(tbPersonalEvents.approvalStatus, sql`'private'`),
          ),
        ),
      )
      .orderBy(desc(tbPersonalEvents.eventDate));

    return events;
  }

  /**
   * Criar metricas de saude
   */
  async createHealthMetrics(createHealthMetricsDto: CreateHealthMetricsDto) {
    // Verificar se usuario existe e eh aluno
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
      throw new NotFoundException('Aluno nao encontrado');
    }

    // Verificar se ja existe metrica
    const [existing] = await this.db
      .select()
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, createHealthMetricsDto.userId))
      .limit(1);

    if (existing) {
      throw new BadRequestException(
        'Mtricas j existem para este aluno. Use PATCH para atualizar.',
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
   * Atualizar mtricas de sade
   */
  async updateHealthMetrics(
    userId: string,
    updateHealthMetricsDto: UpdateHealthMetricsDto,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    // Buscar permisses se for aluno tentando editar
    if (userRole === UserRole.ALUNO && userId === requestingUserId) {
      const [permissions] = await this.db
        .select()
        .from(tbStudentPermissions)
        .where(eq(tbStudentPermissions.userId, userId))
        .limit(1);

      // Verificar cada campo que o aluno est tentando editar
      const updates: any = {};

      if (updateHealthMetricsDto.heightCm !== undefined) {
        if (!permissions?.canEditHeight) {
          throw new ForbiddenException(
            'Voc no tem permisso para editar altura',
          );
        }
        updates.heightCm = updateHealthMetricsDto.heightCm;
      }

      if (updateHealthMetricsDto.weightKg !== undefined) {
        if (!permissions?.canEditWeight) {
          throw new ForbiddenException('Voc no tem permisso para editar peso');
        }
        updates.weightKg = updateHealthMetricsDto.weightKg;
      }

      if (updateHealthMetricsDto.bloodType !== undefined) {
        if (!permissions?.canEditBloodType) {
          throw new ForbiddenException(
            'Voc no tem permisso para editar tipo sanguneo',
          );
        }
        updates.bloodType = updateHealthMetricsDto.bloodType;
      }

      if (updateHealthMetricsDto.medications !== undefined) {
        if (!permissions?.canEditMedications) {
          throw new ForbiddenException(
            'Voc no tem permisso para editar medicaes',
          );
        }
        updates.medications = updateHealthMetricsDto.medications;
      }

      if (updateHealthMetricsDto.allergies !== undefined) {
        if (!permissions?.canEditAllergies) {
          throw new ForbiddenException(
            'Voc no tem permisso para editar alergias',
          );
        }
        updates.allergies = updateHealthMetricsDto.allergies;
      }

      if (updateHealthMetricsDto.injuries !== undefined) {
        if (!permissions?.canEditInjuries) {
          throw new ForbiddenException('Voc no tem permisso para editar leses');
        }
        updates.injuries = updateHealthMetricsDto.injuries;
      }

      if (
        updateHealthMetricsDto.alimentalRoutine !== undefined ||
        updateHealthMetricsDto.diaryRoutine !== undefined
      ) {
        if (!permissions?.canEditRoutine) {
          throw new ForbiddenException(
            'Voc no tem permisso para editar rotina',
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
            'Voc no tem permisso para editar suplementos',
          );
        }
        if (updateHealthMetricsDto.useSupplements !== undefined)
          updates.useSupplements = updateHealthMetricsDto.useSupplements;
        if (updateHealthMetricsDto.whatSupplements)
          updates.whatSupplements = updateHealthMetricsDto.whatSupplements;
      }

      // Aluno no pode editar anotaes de coach
      if (
        updateHealthMetricsDto.coachObservations ||
        updateHealthMetricsDto.coachObservationsParticular
      ) {
        throw new ForbiddenException('Voc no pode editar anotaes de coaches');
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
      throw new NotFoundException('Mtricas de sade no encontradas');
    }

    return updated;
  }

  /**
   * Perfil completo (ADMIN/MASTER)
   */
  async getFullProfile(id: string) {
    const [student] = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        userRole: tbUsers.userRole,
        personalData: {
          email: tbPersonalData.email,
          cpf: tbPersonalData.cpf,
          bornDate: tbPersonalData.bornDate,
          address: tbPersonalData.address,
          sex: tbPersonalData.sex,
          telephone: tbPersonalData.telephone,
        },
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(and(eq(tbUsers.id, id), isNull(tbUsers.deletedAt)))
      .limit(1);

    if (!student) {
      throw new NotFoundException('Aluno no encontrado');
    }

    const [health] = await this.db
      .select()
      .from(tbHealthMetrics)
      .where(eq(tbHealthMetrics.userId, id))
      .limit(1);

    const financialRecords = await this.db
      .select({
        id: tbFinancial.id,
        amountInCents: tbFinancial.monthlyFeeValue,
        dueDate: tbFinancial.dueDate,
        paid: tbFinancial.paid,
        paymentMethod: tbFinancial.paymentMethod,
        lastPaymentDate: tbFinancial.lastPaymentDate,
        createdAt: tbFinancial.createdAt,
      })
      .from(tbFinancial)
      .where(eq(tbFinancial.userId, id))
      .orderBy(desc(tbFinancial.createdAt))
      .limit(20);

    const checkIns = await this.db
      .select({
        id: tbCheckIns.id,
        checkInDate: tbCheckIns.checkInDate,
        checkInTime: tbCheckIns.checkInTime,
        method: tbCheckIns.method,
        identifier: tbCheckIns.identifier,
      })
      .from(tbCheckIns)
      .where(eq(tbCheckIns.userId, id))
      .orderBy(desc(tbCheckIns.checkInDate))
      .limit(30);

    return {
      student,
      health,
      financial: financialRecords,
      checkIns,
    };
  }

  /**
   * Atualizar dados pessoais/financeiros do aluno (ADMIN/MASTER)
   */
  async updateStudent(id: string, dto: UpdateStudentDto) {
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(and(eq(tbUsers.id, id), isNull(tbUsers.deletedAt)));

    if (!user) {
      throw new NotFoundException('Aluno no encontrado');
    }

    const userUpdate: Record<string, unknown> = {};
    if (dto.name) {
      userUpdate.name = dto.name;
    }
    if (dto.isActive !== undefined) {
      userUpdate.isActive = dto.isActive;
    }
    if (Object.keys(userUpdate).length > 0) {
      await this.db.update(tbUsers).set(userUpdate).where(eq(tbUsers.id, id));
    }

    const personalUpdate: Record<string, unknown> = {};
    if (dto.email !== undefined) personalUpdate.email = dto.email;
    if (dto.telephone !== undefined) personalUpdate.telephone = dto.telephone;
    if (dto.cpf !== undefined) personalUpdate.cpf = dto.cpf;
    if (dto.address !== undefined) personalUpdate.address = dto.address;
    if (dto.sex !== undefined) personalUpdate.sex = dto.sex;
    if (dto.bornDate !== undefined)
      personalUpdate.bornDate = new Date(dto.bornDate);

    if (Object.keys(personalUpdate).length > 0) {
      const [existingPersonal] = await this.db
        .select()
        .from(tbPersonalData)
        .where(eq(tbPersonalData.userId, id))
        .limit(1);

      if (existingPersonal) {
        await this.db
          .update(tbPersonalData)
          .set(personalUpdate)
          .where(eq(tbPersonalData.userId, id));
      } else {
        // tbPersonalData exige campos obrigatrios: cpf, bornDate, address, telephone, email
        if (
          personalUpdate.cpf === undefined ||
          personalUpdate.bornDate === undefined ||
          personalUpdate.address === undefined ||
          personalUpdate.telephone === undefined ||
          personalUpdate.email === undefined
        ) {
          throw new BadRequestException(
            'Para criar dados pessoais, informe cpf, bornDate, address, telephone e email',
          );
        }

        const insertPersonal = { userId: id, ...(personalUpdate as any) };
        await this.db.insert(tbPersonalData).values(insertPersonal);
      }
    }

    if (
      dto.monthlyFeeValueInCents !== undefined ||
      dto.paymentMethod !== undefined ||
      dto.dueDate !== undefined
    ) {
      const [financial] = await this.db
        .select()
        .from(tbFinancial)
        .where(eq(tbFinancial.userId, id))
        .orderBy(desc(tbFinancial.createdAt))
        .limit(1);

      const financialData: Record<string, unknown> = {};
      if (dto.monthlyFeeValueInCents !== undefined) {
        financialData.monthlyFeeValue = dto.monthlyFeeValueInCents;
      }
      if (dto.paymentMethod !== undefined) {
        financialData.paymentMethod = dto.paymentMethod;
      }
      if (dto.dueDate !== undefined) {
        financialData.dueDate = dto.dueDate;
      }

      if (financial) {
        await this.db
          .update(tbFinancial)
          .set(financialData)
          .where(eq(tbFinancial.id, financial.id));
      } else {
        await this.db.insert(tbFinancial).values({
          userId: id,
          monthlyFeeValue: dto.monthlyFeeValueInCents ?? 0,
          paymentMethod: dto.paymentMethod ?? 'desconhecido',
          dueDate: dto.dueDate ?? 1,
          paid: false,
        });
      }
    }

    return { success: true, message: 'Aluno atualizado com sucesso' };
  }



  async updatePersonalEvent(
    id: string,
    dto: Partial<CreatePersonalEventDto>,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    const [event] = await this.db
      .select()
      .from(tbPersonalEvents)
      .where(eq(tbPersonalEvents.id, id))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento pessoal nao encontrado');
    }

    const isOwner = event.userId === requestingUserId;
    const canManage =
      isOwner ||
      [UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO].includes(
        userRole,
      );

    if (!canManage) {
      throw new ForbiddenException('Sem permissao para editar este evento');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.date !== undefined) updateData.eventDate = dto.date;
    if (dto.time !== undefined) updateData.eventTime = dto.time;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.hideLocation !== undefined)
      updateData.hideLocation = dto.hideLocation;

    const [updated] = await this.db
      .update(tbPersonalEvents)
      .set(updateData)
      .where(eq(tbPersonalEvents.id, id))
      .returning();

    if (updated?.isPublic) {
      const slug = `personal-${id}`;
      await this.db
        .update(tbBlogPosts)
        .set({
          title: updated.title,
          content: updated.description,
          excerpt:
            updated.description?.slice(0, 140) ?? updated.description ?? null,
          eventDate: updated.eventDate,
          eventTime: updated.eventTime,
          location: updated.location,
          hideLocation: updated.hideLocation,
          metaTitle: updated.title,
          metaDescription:
            updated.description?.slice(0, 160) ?? updated.description ?? null,
          updatedAt: new Date(),
        })
        .where(eq(tbBlogPosts.slug, slug));
    }

    return updated;
  }

  async deletePersonalEvent(
    id: string,
    requestingUserId: string,
    userRole: UserRole,
  ) {
    const [event] = await this.db
      .select()
      .from(tbPersonalEvents)
      .where(eq(tbPersonalEvents.id, id))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Evento pessoal nao encontrado');
    }

    const isOwner = event.userId === requestingUserId;
    const canManage =
      isOwner ||
      [UserRole.ADMIN, UserRole.MASTER, UserRole.FUNCIONARIO].includes(
        userRole,
      );

    if (!canManage) {
      throw new ForbiddenException('Sem permissao para excluir este evento');
    }

    if (event.isPublic) {
      const slug = `personal-${id}`;
      await this.db.delete(tbBlogPosts).where(eq(tbBlogPosts.slug, slug));
    }

    await this.db.delete(tbPersonalEvents).where(eq(tbPersonalEvents.id, id));

    return { success: true };
  }
  /**
   * Adicionar observao de coach (apenas COACH, ADMIN, MASTER)
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
        'Mtricas de sade no encontradas. Crie as mtricas primeiro.',
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
