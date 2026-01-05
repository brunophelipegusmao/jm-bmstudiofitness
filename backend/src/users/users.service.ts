import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { and, asc, desc, eq, isNull, like, or, sql } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../database/schema';

import {
  tbFinancial,
  tbEmployeePermissions,
  tbPersonalData,
  tbStudentPermissions,
  tbUsers,
  UserRole,
} from '../database/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import {
  UpdateEmployeePermissionsDto,
  UpdateStudentPermissionsDto,
} from './dto/update-permissions.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /**
   * Criar novo usuÃ¡rio
   */
  async create(createUserDto: CreateUserDto, requestingUserId?: string) {
    // Verificar se email jÃ¡ existe
    const existingEmail = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.email, createUserDto.email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw new ConflictException('Email jÃ¡ cadastrado');
    }

    // Verificar se CPF jÃ¡ existe
    const existingCpf = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.cpf, createUserDto.cpf))
      .limit(1);

    if (existingCpf.length > 0) {
      throw new ConflictException('CPF jÃ¡ cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criar usuÃ¡rio
    const [newUser] = await this.db
      .insert(tbUsers)
      .values({
        name: createUserDto.name,
        password: hashedPassword,
        userRole: createUserDto.role || UserRole.ALUNO,
        isActive: true,
      })
      .returning();

    // Criar dados pessoais
    await this.db.insert(tbPersonalData).values({
      userId: newUser.id,
      cpf: createUserDto.cpf,
      bornDate: createUserDto.bornDate,
      address: createUserDto.address,
      telephone: createUserDto.telephone,
      email: createUserDto.email,
    });

    // Criar permissÃµes padrÃ£o se for FUNCIONARIO
    if (newUser.userRole === UserRole.FUNCIONARIO) {
      await this.db.insert(tbEmployeePermissions).values({
        userId: newUser.id,
        canViewFinancial: false,
        canEditFinancial: false,
        canDeleteFinancial: false,
        canManageCheckIns: true,
        canViewStudents: true,
      });
    }

    // Criar permissÃµes padrÃ£o se for ALUNO
    if (newUser.userRole === UserRole.ALUNO) {
      await this.db.insert(tbStudentPermissions).values({
        userId: newUser.id,
        canEditHeight: false,
        canEditWeight: true,
        canEditBloodType: false,
        canEditMedications: true,
        canEditAllergies: true,
        canEditInjuries: true,
        canEditRoutine: true,
        canEditSupplements: true,
      });
    }

    // Retornar usuÃ¡rio sem senha
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Listar usuÃ¡rios com filtros e paginaÃ§Ã£o
   */
  async findAll(queryDto: QueryUsersDto) {
    const {
      search,
      role,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = queryDto;

    const offset = (page - 1) * limit;

    const whereConditions: SQLWrapper[] = [isNull(tbUsers.deletedAt)];
    if (role) {
      whereConditions.push(eq(tbUsers.userRole, role));
    }

    if (search) {
      const searchCondition = or(
        like(tbUsers.name, `%${search}%`),
        like(tbPersonalData.email, `%${search}%`),
      ) as SQLWrapper;
      whereConditions.push(searchCondition);
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const orderDirection = order === 'asc' ? asc : desc;
    let orderByColumn;
    if (sortBy === 'name') {
      orderByColumn = orderDirection(tbUsers.name);
    } else if (sortBy === 'email') {
      orderByColumn = orderDirection(tbPersonalData.email);
    } else {
      orderByColumn = orderDirection(tbUsers.createdAt);
    }

    const users = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        userRole: tbUsers.userRole,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        email: tbPersonalData.email,
        cpf: tbPersonalData.cpf,
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(whereClause)
      .orderBy(orderByColumn)
      .limit(limit)
      .offset(offset);

    // Contar total
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(whereClause);

    return {
      data: users,
      meta: {
        total: Number(count),
        page,
        limit,
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  /**
   * Buscar usuÃ¡rio por ID
   */
  async findOne(id: string) {
    const [user] = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        userRole: tbUsers.userRole,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        updatedAt: tbUsers.updatedAt,
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
      .where(eq(tbUsers.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('UsuÃ¡rio nÃ£o encontrado');
    }

    return user;
  }

  /**
   * Buscar usuÃ¡rio por email
   */
  async findByEmail(email: string) {
    const [user] = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        userRole: tbUsers.userRole,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        updatedAt: tbUsers.updatedAt,
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
      .where(eq(tbPersonalData.email, email))
      .limit(1);

    return user || null;
  }

  /**
   * Buscar usuÃ¡rio por CPF
   */
  async findByCpf(cpf: string) {
    const [user] = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        userRole: tbUsers.userRole,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        updatedAt: tbUsers.updatedAt,
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
      .where(eq(tbPersonalData.cpf, cpf))
      .limit(1);

    return user || null;
  }

  /**
   * Atualizar dados do usuÃ¡rio
   */
    async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingRole: UserRole,
    requestingUserId: string,
  ) {
    const target = await this.findOne(id);
    if (
      target?.userRole === UserRole.ADMIN &&
      requestingRole !== UserRole.MASTER
    ) {
      throw new ForbiddenException(
        'Somente MASTER pode alterar usuários ADMIN',
      );
    }

    const updateData: any = { updatedAt: new Date() };

    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.isActive !== undefined)
      updateData.isActive = updateUserDto.isActive;

    const [updatedUser] = await this.db
      .update(tbUsers)
      .set(updateData)
      .where(eq(tbUsers.id, id))
      .returning();

    const personalUpdate: any = {};
    if ((updateUserDto as any).cpf !== undefined)
      personalUpdate.cpf = (updateUserDto as any).cpf;
    if (updateUserDto.bornDate !== undefined)
      personalUpdate.bornDate = updateUserDto.bornDate;
    if (updateUserDto.address !== undefined)
      personalUpdate.address = updateUserDto.address;
    if (updateUserDto.telephone !== undefined)
      personalUpdate.telephone = updateUserDto.telephone;
    if (updateUserDto.email !== undefined)
      personalUpdate.email = updateUserDto.email;
    if ((updateUserDto as any).sex !== undefined)
      personalUpdate.sex = (updateUserDto as any).sex;

    if (Object.keys(personalUpdate).length > 0) {
      await this.db
        .update(tbPersonalData)
        .set(personalUpdate)
        .where(eq(tbPersonalData.userId, id));
    }

    const hasFinanceFields =
      (updateUserDto as any).monthlyFeeValueInCents !== undefined ||
      (updateUserDto as any).paymentMethod !== undefined ||
      (updateUserDto as any).dueDate !== undefined;

    if (hasFinanceFields) {
      const financeUpdate: any = { updatedAt: new Date() };
      if ((updateUserDto as any).monthlyFeeValueInCents !== undefined) {
        financeUpdate.monthlyFeeValue = Number(
          (updateUserDto as any).monthlyFeeValueInCents,
        );
      }
      if ((updateUserDto as any).paymentMethod !== undefined) {
        financeUpdate.paymentMethod = (updateUserDto as any).paymentMethod;
      }
      if ((updateUserDto as any).dueDate !== undefined) {
        financeUpdate.dueDate = Number((updateUserDto as any).dueDate);
      }

      const existingFinance = await this.db
        .select()
        .from(tbFinancial)
        .where(eq(tbFinancial.userId, id))
        .limit(1);

      if (existingFinance.length > 0) {
        await this.db
          .update(tbFinancial)
          .set(financeUpdate)
          .where(eq(tbFinancial.userId, id));
      } else {
        await this.db
          .insert(tbFinancial)
          .values({
            userId: id,
            monthlyFeeValue: financeUpdate.monthlyFeeValue ?? 0,
            dueDate: financeUpdate.dueDate ?? 1,
            paymentMethod: financeUpdate.paymentMethod ?? 'pix',
            paid: false,
          });
      }
    }

    return updatedUser;
  }
  /**
   * Atualizar senha
   */
  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('UsuÃ¡rio nÃ£o encontrado');
    }

    if (dto.currentPassword) {
      if (!user.password) {
        throw new BadRequestException('UsuÃ¡rio nÃ£o possui senha definida');
      }
      const isValid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isValid) {
        throw new BadRequestException('Senha antiga incorreta');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    await this.db
      .update(tbUsers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(tbUsers.id, id));

    return { message: 'Senha atualizada com sucesso' };
  }

  /**
   * Atualizar permissÃµes de funcionÃ¡rio
   */
  async updateEmployeePermissions(
    userId: string,
    dto: UpdateEmployeePermissionsDto,
  ) {
    const [employee] = await this.db
      .select()
      .from(tbEmployeePermissions)
      .where(eq(tbEmployeePermissions.userId, userId))
      .limit(1);

    if (!employee) {
      throw new NotFoundException('PermissÃµes de funcionÃ¡rio nÃ£o encontradas');
    }

    const [updated] = await this.db
      .update(tbEmployeePermissions)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(tbEmployeePermissions.userId, userId))
      .returning();

    return updated;
  }

  async getEmployeePermissions(userId: string) {
    const [permissions] = await this.db
      .select()
      .from(tbEmployeePermissions)
      .where(eq(tbEmployeePermissions.userId, userId))
      .limit(1);

    if (!permissions) {
      throw new NotFoundException('PermissÃµes de funcionÃ¡rio nÃ£o encontradas');
    }

    return permissions;
  }

  /**
   * Atualizar permissÃµes de aluno
   */
  async updateStudentPermissions(
    userId: string,
    dto: UpdateStudentPermissionsDto,
  ) {
    const [studentPermissions] = await this.db
      .select()
      .from(tbStudentPermissions)
      .where(eq(tbStudentPermissions.userId, userId))
      .limit(1);

    if (!studentPermissions) {
      throw new NotFoundException('PermissÃµes de aluno nÃ£o encontradas');
    }

    const [updated] = await this.db
      .update(tbStudentPermissions)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(tbStudentPermissions.userId, userId))
      .returning();

    return updated;
  }

  async getStudentPermissions(userId: string) {
    const [permissions] = await this.db
      .select()
      .from(tbStudentPermissions)
      .where(eq(tbStudentPermissions.userId, userId))
      .limit(1);

    if (!permissions) {
      throw new NotFoundException('PermissÃµes de aluno nÃ£o encontradas');
    }

    return permissions;
  }

  /**
   * Desativar usuÃ¡rio (soft delete)
   */
  async softDelete(id: string, requestingUserId: string, role: UserRole) {
    if (role !== UserRole.MASTER && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Apenas ADMIN ou MASTER podem desativar usuÃ¡rios',
      );
    }

    if (id === requestingUserId) {
      throw new BadRequestException('VocÃª nÃ£o pode desativar a si mesmo');
    }

    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('UsuÃ¡rio nÃ£o encontrado');
    }

    const [updated] = await this.db
      .update(tbUsers)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tbUsers.id, id))
      .returning();

    return updated;
  }

  /**
   * ExclusÃ£o definitiva com limpeza de dependÃªncias (check-ins, permissÃµes, dados pessoais, financeiro, etc.)
   */
    async hardDelete(id: string, requestingUserId: string, role: UserRole) {
    if (role !== UserRole.MASTER && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas ADMIN ou MASTER podem excluir usuarios');
    }

    if (id === requestingUserId) {
      throw new BadRequestException('Voce nao pode excluir a si mesmo');
    }

    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    // Liberar referencias de waitlist (convertedToUserId) para evitar FK
    await this.db
      .update(schema.tbWaitlist)
      .set({ convertedToUserId: null, updatedAt: new Date() })
      .where(eq(schema.tbWaitlist.convertedToUserId, id));

    // Limpa dependencias principais
    await this.db.delete(schema.tbCheckIns).where(eq(schema.tbCheckIns.userId, id));
    await this.db
      .delete(schema.tbEmployeePermissions)
      .where(eq(schema.tbEmployeePermissions.userId, id));
    await this.db
      .delete(schema.tbStudentPermissions)
      .where(eq(schema.tbStudentPermissions.userId, id));
    await this.db.delete(schema.tbHealthMetrics).where(eq(schema.tbHealthMetrics.userId, id));
    await this.db.delete(schema.tbFinancial).where(eq(schema.tbFinancial.userId, id));
    await this.db
      .delete(schema.tbBodyMeasurements)
      .where(eq(schema.tbBodyMeasurements.userId, id));
    await this.db
      .delete(schema.tbPasswordResetTokens)
      .where(eq(schema.tbPasswordResetTokens.userId, id));

    // Dados pessoais
    await this.db.delete(tbPersonalData).where(eq(tbPersonalData.userId, id));

    // Finalmente, o usuario
    await this.db.delete(tbUsers).where(eq(tbUsers.id, id));

    return { success: true };
  }
async restore(id: string) {
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('UsuÃ¡rio nÃ£o encontrado');
    }

    const [updated] = await this.db
      .update(tbUsers)
      .set({
        isActive: true,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(tbUsers.id, id))
      .returning();

    return updated;
  }

  /**
   * Alias usado no controller antigo
   */
  async remove(id: string, requestingUserId: string) {
    // Recuperar role do solicitante nÃ£o estÃ¡ disponÃ­vel aqui, entÃ£o restringimos a ADMIN/Master no controller
    return this.softDelete(id, requestingUserId, UserRole.ADMIN);
  }
}



