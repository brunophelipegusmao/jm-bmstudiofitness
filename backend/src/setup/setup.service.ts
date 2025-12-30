import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { count, eq, sql } from 'drizzle-orm';

import { db } from '../database/db';
import { tbPersonalData, tbUsers, UserRole } from '../database/schema';
import { CreateFirstAdminDto } from './dto/create-first-admin.dto';

@Injectable()
export class SetupService {
  /**
   * Verifica se o banco de dados está conectado e funcionando
   */
  async checkDatabaseConnection(): Promise<{
    connected: boolean;
    database: string | null;
    error?: string;
  }> {
    try {
      // Tenta executar uma query simples
      const result = await db.execute(sql`SELECT current_database() as db`);
      const dbName =
        result.rows && result.rows[0]
          ? (result.rows[0] as { db: string }).db
          : 'unknown';

      return {
        connected: true,
        database: dbName,
      };
    } catch (error) {
      return {
        connected: false,
        database: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Verifica se já existe um usuário admin/master no sistema
   */
  async hasAdminUser(): Promise<{
    hasAdmin: boolean;
    adminCount: number;
    masterCount: number;
  }> {
    try {
      const [adminResult] = await db
        .select({ count: count() })
        .from(tbUsers)
        .where(eq(tbUsers.userRole, UserRole.ADMIN));

      const [masterResult] = await db
        .select({ count: count() })
        .from(tbUsers)
        .where(eq(tbUsers.userRole, UserRole.MASTER));

      const adminCount = adminResult?.count ?? 0;
      const masterCount = masterResult?.count ?? 0;

      return {
        hasAdmin: adminCount > 0 || masterCount > 0,
        adminCount,
        masterCount,
      };
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      return {
        hasAdmin: false,
        adminCount: 0,
        masterCount: 0,
      };
    }
  }

  /**
   * Cria o primeiro usuário MASTER do sistema
   */
  async createFirstAdmin(createFirstAdminDto: CreateFirstAdminDto) {
    // Verifica se já existe admin
    const { hasAdmin } = await this.hasAdminUser();

    if (hasAdmin) {
      throw new BadRequestException(
        'Já existe um administrador no sistema. Não é possível criar outro via setup.',
      );
    }

    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(
        createFirstAdminDto.password,
        12,
      );

      // Criar usuário MASTER
      const [newUser] = await db
        .insert(tbUsers)
        .values({
          name: createFirstAdminDto.name,
          password: hashedPassword,
          userRole: UserRole.MASTER,
          isActive: true,
        })
        .returning();

      // Criar dados pessoais
      await db.insert(tbPersonalData).values({
        userId: newUser.id,
        cpf: createFirstAdminDto.cpf.replace(/\D/g, ''),
        email: createFirstAdminDto.email,
        telephone: createFirstAdminDto.telephone,
        address: createFirstAdminDto.address ?? 'Endereço não informado',
        bornDate: createFirstAdminDto.bornDate ?? '1990-01-01',
      });

      return {
        success: true,
        message: 'Usuário MASTER criado com sucesso!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: createFirstAdminDto.email,
          role: newUser.userRole,
        },
      };
    } catch (error) {
      console.error('Erro ao criar primeiro admin:', error);

      // Verificar erros de constraint única
      if (error instanceof Error) {
        if (error.message.includes('tb_personal_data_cpf_unique')) {
          throw new BadRequestException('CPF já cadastrado no sistema');
        }
        if (error.message.includes('tb_personal_data_email_unique')) {
          throw new BadRequestException('Email já cadastrado no sistema');
        }
      }

      throw new InternalServerErrorException(
        'Erro ao criar usuário administrador',
      );
    }
  }

  /**
   * Retorna informações completas do diagnóstico do sistema
   */
  async getDatabaseInfo() {
    const connectionCheck = await this.checkDatabaseConnection();
    const adminCheck = await this.hasAdminUser();

    // Contar registros em tabelas principais
    let usersCount = 0;
    let checkInsCount = 0;
    let financialCount = 0;

    if (connectionCheck.connected) {
      try {
        const [users] = await db.select({ count: count() }).from(tbUsers);
        usersCount = users?.count ?? 0;
      } catch {
        /* tabela pode não existir */
      }
    }

    return {
      database: {
        connected: connectionCheck.connected,
        name: connectionCheck.database,
        error: connectionCheck.error,
      },
      admin: {
        hasAdmin: adminCheck.hasAdmin,
        adminCount: adminCheck.adminCount,
        masterCount: adminCheck.masterCount,
      },
      stats: {
        usersCount,
        checkInsCount,
        financialCount,
      },
      setupRequired: !adminCheck.hasAdmin,
      timestamp: new Date().toISOString(),
    };
  }
}
