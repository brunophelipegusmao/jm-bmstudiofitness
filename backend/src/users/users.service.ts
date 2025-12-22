import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq, and, isNull, or, like, sql, desc, asc } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import {
  tbUsers,
  tbPersonalData,
  tbEmployeePermissions,
  tbStudentPermissions,
  UserRole,
} from '../database/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdatePasswordDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import {
  UpdateEmployeePermissionsDto,
  UpdateStudentPermissionsDto,
} from './dto/update-permissions.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE')
    private readonly db: NeonHttpDatabase<any>,
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

    // Construir condições where
    const whereConditions: any[] = [isNull(tbUsers.deletedAt)];

    if (role) {
      whereConditions.push(eq(tbUsers.userRole, role));
    }

    if (search) {
      whereConditions.push(
        or(
          like(tbUsers.name, `%${search}%`),
          like(tbPersonalData.email, `%${search}%`),
          like(tbPersonalData.cpf, `%${search}%`),
        ),
      );
    }

    // Ordenação
    const orderDirection = order === 'asc' ? asc : desc;
    let orderByColumn;
    if (sortBy === 'name') {
      orderByColumn = orderDirection(tbUsers.name);
    } else if (sortBy === 'email') {
      orderByColumn = orderDirection(tbPersonalData.email);
    } else {
      orderByColumn = orderDirection(tbUsers.createdAt);
    }

    // Query principal
    const users = await this.db
      .select({
        id: tbUsers.id,
        name: tbUsers.name,
        userRole: tbUsers.userRole,
        isActive: tbUsers.isActive,
        createdAt: tbUsers.createdAt,
        email: tbPersonalData.email,
        cpf: tbPersonalData.cpf,
        telephone: tbPersonalData.telephone,
      })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(and(...whereConditions))
      .orderBy(orderByColumn)
      .limit(limit)
      .offset(offset);

    // Contar total
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tbUsers)
      .leftJoin(tbPersonalData, eq(tbUsers.id, tbPersonalData.userId))
      .where(
        and(
          isNull(tbUsers.deletedAt),
          role ? eq(tbUsers.userRole, role) : undefined,
          search
            ? or(
                like(tbUsers.name, `%${search}%`),
                like(tbPersonalData.email, `%${search}%`),
                like(tbPersonalData.cpf, `%${search}%`),
              )
            : undefined,
        ),
      );

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
      .where(and(eq(tbUsers.id, id), isNull(tbUsers.deletedAt)))
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
    const [personalData] = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.email, email))
      .limit(1);

    if (!personalData) {
      return null;
    }

    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(
        and(eq(tbUsers.id, personalData.userId), isNull(tbUsers.deletedAt)),
      )
      .limit(1);

    return user;
  }

  /**
   * Buscar usuário por CPF
   */
  async findByCpf(cpf: string) {
    const [personalData] = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.cpf, cpf))
      .limit(1);

    if (!personalData) {
      return null;
    }

    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(
        and(eq(tbUsers.id, personalData.userId), isNull(tbUsers.deletedAt)),
      )
      .limit(1);

    return user;
  }

  /**
   * Atualizar usuário
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUserId?: string,
  ) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Atualizar dados do usuário
    const userUpdates: any = {};
    if (updateUserDto.name) userUpdates.name = updateUserDto.name;
    if (updateUserDto.isActive !== undefined)
      userUpdates.isActive = updateUserDto.isActive;
    userUpdates.updatedAt = new Date();

    if (Object.keys(userUpdates).length > 0) {
      await this.db.update(tbUsers).set(userUpdates).where(eq(tbUsers.id, id));
    }

    // Atualizar dados pessoais
    const personalDataUpdates: any = {};
    if (updateUserDto.email) {
      // Verificar se email já existe em outro usuário
      const existingEmail = await this.db
        .select()
        .from(tbPersonalData)
        .where(
          and(
            eq(tbPersonalData.email, updateUserDto.email),
            sql`${tbPersonalData.userId} != ${id}`,
          ),
        )
        .limit(1);

      if (existingEmail.length > 0) {
        throw new ConflictException('Email já cadastrado');
      }
      personalDataUpdates.email = updateUserDto.email;
    }
    if (updateUserDto.address)
      personalDataUpdates.address = updateUserDto.address;
    if (updateUserDto.telephone)
      personalDataUpdates.telephone = updateUserDto.telephone;
    if (updateUserDto.bornDate)
      personalDataUpdates.bornDate = updateUserDto.bornDate;

    if (Object.keys(personalDataUpdates).length > 0) {
      await this.db
        .update(tbPersonalData)
        .set(personalDataUpdates)
        .where(eq(tbPersonalData.userId, id));
    }

    return this.findOne(id);
  }

  /**
   * Atualizar senha
   */
  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
    requestingUserId?: string,
  ) {
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(and(eq(tbUsers.id, id), isNull(tbUsers.deletedAt)))
      .limit(1);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se houver senha atual, verificar
    if (updatePasswordDto.currentPassword) {
      if (!user.password) {
        throw new BadRequestException('Usuário não possui senha cadastrada');
      }

      const isPasswordValid = await bcrypt.compare(
        updatePasswordDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Senha atual incorreta');
      }
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    await this.db
      .update(tbUsers)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(tbUsers.id, id));

    return { message: 'Senha atualizada com sucesso' };
  }

  /**
   * Soft delete de usuário
   */
  async remove(id: string, requestingUserId?: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Soft delete
    await this.db
      .update(tbUsers)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(tbUsers.id, id));

    return { message: 'Usuário deletado com sucesso' };
  }

  /**
   * Buscar permissões de funcionário
   */
  async getEmployeePermissions(userId: string) {
    const [permissions] = await this.db
      .select()
      .from(tbEmployeePermissions)
      .where(eq(tbEmployeePermissions.userId, userId))
      .limit(1);

    if (!permissions) {
      throw new NotFoundException('Permissões não encontradas');
    }

    return permissions;
  }

  /**
   * Atualizar permissões de funcionário (apenas MASTER)
   */
  async updateEmployeePermissions(
    userId: string,
    updatePermissionsDto: UpdateEmployeePermissionsDto,
  ) {
    // Verificar se usuário é funcionário
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, userId))
      .limit(1);

    if (!user || user.userRole !== UserRole.FUNCIONARIO) {
      throw new BadRequestException('Usuário não é funcionário');
    }

    // Verificar se permissões já existem
    const [existing] = await this.db
      .select()
      .from(tbEmployeePermissions)
      .where(eq(tbEmployeePermissions.userId, userId))
      .limit(1);

    if (existing) {
      // Atualizar
      await this.db
        .update(tbEmployeePermissions)
        .set({
          ...updatePermissionsDto,
          updatedAt: new Date(),
        })
        .where(eq(tbEmployeePermissions.userId, userId));
    } else {
      // Criar
      await this.db.insert(tbEmployeePermissions).values({
        userId,
        ...updatePermissionsDto,
      });
    }

    return this.getEmployeePermissions(userId);
  }

  /**
   * Buscar permissões de aluno
   */
  async getStudentPermissions(userId: string) {
    const [permissions] = await this.db
      .select()
      .from(tbStudentPermissions)
      .where(eq(tbStudentPermissions.userId, userId))
      .limit(1);

    if (!permissions) {
      throw new NotFoundException('Permissões não encontradas');
    }

    return permissions;
  }

  /**
   * Atualizar permissões de aluno (MASTER ou ADMIN)
   */
  async updateStudentPermissions(
    userId: string,
    updatePermissionsDto: UpdateStudentPermissionsDto,
  ) {
    // Verificar se usuário é aluno
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, userId))
      .limit(1);

    if (!user || user.userRole !== UserRole.ALUNO) {
      throw new BadRequestException('Usuário não é aluno');
    }

    // Verificar se permissões já existem
    const [existing] = await this.db
      .select()
      .from(tbStudentPermissions)
      .where(eq(tbStudentPermissions.userId, userId))
      .limit(1);

    if (existing) {
      // Atualizar
      await this.db
        .update(tbStudentPermissions)
        .set({
          ...updatePermissionsDto,
          updatedAt: new Date(),
        })
        .where(eq(tbStudentPermissions.userId, userId));
    } else {
      // Criar
      await this.db.insert(tbStudentPermissions).values({
        userId,
        ...updatePermissionsDto,
      });
    }

    return this.getStudentPermissions(userId);
  }
}
