import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { tbUsers, tbPersonalData, UserRole } from '../database/schema';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE') private db: NeonHttpDatabase<any>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Buscar usuário pelo email
    const [personalData] = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.email, loginDto.email))
      .limit(1);

    if (!personalData) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Buscar dados do usuário
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(
        and(eq(tbUsers.id, personalData.userId), eq(tbUsers.isActive, true)),
      )
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Usuário inativo ou não encontrado');
    }

    // Verificar senha
    if (!user.password) {
      throw new UnauthorizedException('Usuário sem senha cadastrada');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: personalData.email,
      role: user.userRole,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: personalData.email,
        role: user.userRole,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Verificar se email já existe
    const [existingEmail] = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.email, registerDto.email))
      .limit(1);

    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar se CPF já existe
    const [existingCpf] = await this.db
      .select()
      .from(tbPersonalData)
      .where(eq(tbPersonalData.cpf, registerDto.cpf))
      .limit(1);

    if (existingCpf) {
      throw new ConflictException('CPF já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar usuário
    const [newUser] = await this.db
      .insert(tbUsers)
      .values({
        name: registerDto.name,
        password: hashedPassword,
        userRole: registerDto.role || UserRole.ALUNO,
        isActive: true,
      })
      .returning();

    // Criar dados pessoais
    await this.db.insert(tbPersonalData).values({
      userId: newUser.id,
      cpf: registerDto.cpf,
      email: registerDto.email,
      bornDate: registerDto.bornDate,
      address: registerDto.address,
      telephone: registerDto.telephone,
    });

    // Gerar tokens
    const payload: JwtPayload = {
      sub: newUser.id,
      email: registerDto.email,
      role: newUser.userRole,
      name: newUser.name,
    };

    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: registerDto.email,
        role: newUser.userRole,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      // Buscar usuário atualizado
      const [user] = await this.db
        .select()
        .from(tbUsers)
        .where(eq(tbUsers.id, payload.sub))
        .limit(1);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      const [personalData] = await this.db
        .select()
        .from(tbPersonalData)
        .where(eq(tbPersonalData.userId, user.id))
        .limit(1);

      if (!personalData) {
        throw new UnauthorizedException('Dados pessoais não encontrados');
      }

      // Gerar novos tokens
      const newPayload: JwtPayload = {
        sub: user.id,
        email: personalData.email,
        role: user.userRole,
        name: user.name,
      };

      const accessToken = this.jwtService.sign(newPayload);

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        expiresIn: '30d',
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: personalData.email,
          role: user.userRole,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async validateUser(userId: string): Promise<any> {
    const [user] = await this.db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, userId))
      .limit(1);

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }
}
