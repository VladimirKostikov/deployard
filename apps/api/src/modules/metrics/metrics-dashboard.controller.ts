import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetricsDashboardSummary, AccessLevel, AppSection } from '@dpd/shared';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { MetricsSummaryService } from './metrics-summary.service';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsDashboardController {
  constructor(private readonly metricsSummaryService: MetricsSummaryService) {}

  @Get('dashboard')
  @RequireAccess(AppSection.METRICS, AccessLevel.VIEW)
  getDashboard(): Promise<MetricsDashboardSummary> {
    return this.metricsSummaryService.getDashboardSummary();
  }
}
