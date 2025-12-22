import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator @CurrentUser()
 *
 * Extrai o usuário autenticado da request
 * Funciona após o JwtAuthGuard ter validado o token
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: any) {
 *   return this.usersService.findOne(user.id);
 * }
 * ```
 *
 * Você pode extrair propriedades específicas:
 * ```typescript
 * @Get('my-data')
 * async getData(@CurrentUser('id') userId: number) {
 *   return this.usersService.findOne(userId);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Se data foi passado, retorna propriedade específica
    return data ? user?.[data] : user;
  },
);
