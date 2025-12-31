import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../../database/schema';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    if (!user) {
      return false;
    }

    // MASTER tem acesso a tudo
    if (user.role === UserRole.MASTER) {
      return true;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
