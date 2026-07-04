import { Controller, Get, Header, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../auth/decorators/auth.decorators';
import { MetricsAccessGuard } from './metrics-access.guard';
import { MetricsRegistry } from './metrics.registry';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsRegistry: MetricsRegistry) {}

  @Public()
  @UseGuards(MetricsAccessGuard)
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(@Res() response: Response) {
    response.send(await this.metricsRegistry.registry.metrics());
  }
}
