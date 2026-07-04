import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsRegistry } from '../../modules/metrics/metrics.registry';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsRegistry: MetricsRegistry) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string; route?: { path?: string } }>();
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();
    const startedAt = process.hrtime.bigint();
    const method = request.method;
    const route = request.route?.path ?? 'unknown';

    return next.handle().pipe(
      tap({
        next: () => this.record(method, route, response.statusCode, startedAt),
        error: () => this.record(method, route, response.statusCode || 500, startedAt),
      }),
    );
  }

  private record(method: string, route: string, status: number, startedAt: bigint) {
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    const labels = { method, route, status: String(status) };

    this.metricsRegistry.httpRequestsTotal.inc(labels);
    this.metricsRegistry.httpRequestDuration.observe(labels, durationSeconds);
  }
}
