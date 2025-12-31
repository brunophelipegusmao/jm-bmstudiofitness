import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard JWT Global
 *
 * Valida tokens JWT em todas as rotas exceto as marcadas com @Public()
 * Este é o ponto central de autenticação da API
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Verifica se a rota é pública via metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const path: string = request?.url ?? '';
    // Fallback adicional para rotas public de eventos e waitlist
    const pathIsPublic =
      path.includes('/events/public') ||
      path.includes('/events/calendar') ||
      path.includes('/waitlist');

    if (isPublic || pathIsPublic) {
      return true;
    }

    // Continua com validação JWT padrão
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Se houver erro ou usuário não existir, lança exceção
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}
