import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware de Logging
 *
 * Adiciona request-id único e loga todas as requisições HTTP
 * Útil para debugging, auditoria e correlação de logs
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Adiciona request-id aos headers
    req['requestId'] = requestId;
    res.setHeader('X-Request-Id', requestId);

    // Loga início da requisição
    this.logger.log(`[${requestId}] --> ${method} ${originalUrl} | IP: ${ip}`);

    // Hook no evento de finalização da response
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;

      // Determina nível de log baseado no status code
      const logMessage = `[${requestId}] <-- ${method} ${originalUrl} ${statusCode} | ${duration}ms | ${contentLength} bytes`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
