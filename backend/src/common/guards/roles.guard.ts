import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// RBAC guard aplicado globalmente apos JWT
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Se rota for publica, libera
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const path: string = request?.url ?? '';
    // Liberar waitlist mesmo sem token (conversao/matricula publica)
    if (path.includes('/waitlist')) {
      return true;
    }

    // Busca roles necessarias dos metadados
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se nao ha roles definidas, permite acesso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Extrai usuario da request (ja validado pelo JwtAuthGuard)
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('Usuario nao autenticado');
    }

    // Verifica se o usuario tem uma das roles necessarias
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Acesso negado. Necessario: ' + requiredRoles.join(' ou ') + '. Voce: ' + user.role,
      );
    }

    return true;
  }
}
