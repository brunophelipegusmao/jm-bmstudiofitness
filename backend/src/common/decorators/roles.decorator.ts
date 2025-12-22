import { SetMetadata } from '@nestjs/common';

/**
 * Decorator @Roles()
 *
 * Define quais roles têm permissão para acessar uma rota
 * Deve ser usado JUNTO com autenticação
 *
 * @example
 * ```typescript
 * @Roles('admin', 'funcionario')
 * @Get('users')
 * async listUsers() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
