import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import {
  UpdateEmployeePermissionsDto,
  UpdateStudentPermissionsDto,
} from './dto/update-permissions.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Criar novo usuário (apenas ADMIN e MASTER)
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('userId') requestingUserId: string,
  ) {
    return this.usersService.create(createUserDto, requestingUserId);
  }

  /**
   * Listar todos os usuários com filtros (ADMIN, MASTER)
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH)
  findAll(@Query() queryDto: QueryUsersDto) {
    return this.usersService.findAll(queryDto);
  }

  /**
   * Buscar usuário por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Buscar usuário por email
   */
  @Get('email/:email')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  /**
   * Buscar usuário por CPF
   */
  @Get('cpf/:cpf')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  findByCpf(@Param('cpf') cpf: string) {
    return this.usersService.findByCpf(cpf);
  }

  /**
   * Atualizar dados do usuário
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Atualizar senha do usuário
   */
  @Patch(':id/password')
  updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(id, updatePasswordDto);
  }

  /**
   * Soft delete de usuário (apenas ADMIN e MASTER)
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') requestingUserId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.usersService.softDelete(id, requestingUserId, role);
  }

  /**
   * Buscar permissões de funcionário
   */
  @Get(':id/employee-permissions')
  @Roles(UserRole.ADMIN, UserRole.MASTER)
  getEmployeePermissions(@Param('id') id: string) {
    return this.usersService.getEmployeePermissions(id);
  }

  /**
   * Atualizar permissões de funcionário (apenas MASTER)
   */
  @Patch(':id/employee-permissions')
  @Roles(UserRole.MASTER)
  updateEmployeePermissions(
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdateEmployeePermissionsDto,
  ) {
    return this.usersService.updateEmployeePermissions(
      id,
      updatePermissionsDto,
    );
  }

  /**
   * Buscar permissões de aluno
   */
  @Get(':id/student-permissions')
  @Roles(UserRole.ADMIN, UserRole.MASTER, UserRole.COACH)
  getStudentPermissions(@Param('id') id: string) {
    return this.usersService.getStudentPermissions(id);
  }

  /**
   * Atualizar permissões de aluno (MASTER ou ADMIN)
   */
  @Patch(':id/student-permissions')
  @Roles(UserRole.MASTER, UserRole.ADMIN)
  updateStudentPermissions(
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdateStudentPermissionsDto,
  ) {
    return this.usersService.updateStudentPermissions(id, updatePermissionsDto);
  }
}
