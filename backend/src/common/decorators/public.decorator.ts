import { SetMetadata } from '@nestjs/common';

/**
 * Decorator @Public()
 *
 * Marca uma rota como pública (sem necessidade de autenticação)
 * Usado em: login, register, health check, webhooks públicos, etc.
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) {
 *   return this.authService.login(loginDto);
 * }
 * ```
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
