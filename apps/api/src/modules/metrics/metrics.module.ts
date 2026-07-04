import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';
import { MetricsController } from './metrics.controller';
import { MetricsDashboardController } from './metrics-dashboard.controller';
import { MetricsAccessGuard } from './metrics-access.guard';
import { MetricsRegistry } from './metrics.registry';
import { MetricsSummaryService } from './metrics-summary.service';

@Module({
  controllers: [MetricsController, MetricsDashboardController],
  providers: [
    MetricsRegistry,
    MetricsSummaryService,
    MetricsAccessGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [MetricsRegistry],
})
export class MetricsModule {}
