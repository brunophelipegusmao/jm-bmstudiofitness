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
   * Criar novo usuário
   */
  async create(createUserDto: CreateUserDto, requestingUserId?: string) {
    // Verificar se email já existe
    const existingEmail = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.email, createUserDto.email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar se CPF já existe
    const existingCpf = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.cpf, createUserDto.cpf))
      .limit(1);

    if (existingCpf.length > 0) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criar usuário
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

    // Criar permissões padrão se for FUNCIONARIO
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

    // Criar permissões padrão se for ALUNO
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

    // Retornar usuário sem senha
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Listar usuários com filtros e paginação
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
   * Buscar usuário por ID
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
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Buscar usuário por email
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
   * Buscar usuário por CPF
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
   * Atualizar dados do usuário
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const updateData: any = { updatedAt: new Date() };

    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.isActive !== undefined)
      updateData.isActive = updateUserDto.isActive;
    // role não faz parte do DTO atual; manter apenas campos existentes

    // Atualizar tabela de usuários
    const [updatedUser] = await this.db
      .update(tbUsers)
      .set(updateData)
      .where(eq(tbUsers.id, id))
      .returning();

    // Atualizar dados pessoais se fornecidos
    const personalUpdate: any = {};
    if ((updateUserDto as any).cpf !== undefined)
      personalUpdate.cpf = (updateUserDto as any).cpf;
    if (updateUserDto.bornDate !== undefined)
      personalUpdate.bornDate = updateUserDto.bornDate;
    if (updateUserDto.address !== undefined)
      personalUpdate.address = updateUserDto.address;
    if (updateUserDto.telephone !== undefined)
      personalUpdate.telephone = updateUserDto.telephone;
    if (updateUserDto.email !== undefined) personalUpdate.email = updateUserDto.email;

    if (Object.keys(personalUpdate).length > 0) {
      await this.db
        .update(tbPersonalData)
        .set(personalUpdate)
        .where(eq(tbPersonalData.userId, id));
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
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.currentPassword) {
      if (!user.password) {
        throw new BadRequestException('Usuário não possui senha definida');
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
   * Atualizar permissões de funcionário
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
      throw new NotFoundException('Permissões de funcionário não encontradas');
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
      throw new NotFoundException('Permissões de funcionário não encontradas');
    }

    return permissions;
  }

  /**
   * Atualizar permissões de aluno
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
      throw new NotFoundException('Permissões de aluno não encontradas');
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
      throw new NotFoundException('Permissões de aluno não encontradas');
    }

    return permissions;
  }

  /**
   * Desativar usuário (soft delete)
   */
  async softDelete(id: string, requestingUserId: string, role: UserRole) {
    if (role !== UserRole.MASTER && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas ADMIN ou MASTER podem desativar usuários');
    }

    if (id === requestingUserId) {
      throw new BadRequestException('Você não pode desativar a si mesmo');
    }

    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
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
   * Reativar usuário
   */
  async restore(id: string) {
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
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
    // Recuperar role do solicitante não está disponível aqui, então restringimos a ADMIN/Master no controller
    return this.softDelete(id, requestingUserId, UserRole.ADMIN);
  }
}
