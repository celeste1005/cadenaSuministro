import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Solo auditar métodos que modifican datos
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const entityType = this.extractEntityType(url);
          
          await this.prisma.auditLog.create({
            data: {
              userId: user?.id || null,
              action: method,
              entityType,
              entityId: data?.id?.toString() || body?.id?.toString() || null,
              newValues: body || {},
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        } catch (error) {
          this.logger.error(`Error saving audit log: ${error.message}`);
        }
      }),
    );
  }

  private extractEntityType(url: string): string {
    const parts = url.split('/');
    return parts[2] || 'unknown'; // Ajustar según estructura de rutas
  }
}
