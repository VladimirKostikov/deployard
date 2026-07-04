import { Controller, Delete, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AccessLevel, AppSection, PodSummary } from '@dpd/shared';
import { Response } from 'express';
import { ActiveStreamRegistry } from '../../common/streams/active-stream.registry';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { PodsService } from './pods.service';

@ApiTags('pods')
@Controller('pods')
export class PodsController {
  constructor(
    private readonly podsService: PodsService,
    private readonly streamRegistry: ActiveStreamRegistry,
  ) {}

  @Get()
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.VIEW)
  @ApiQuery({ name: 'namespace', required: true })
  @ApiQuery({ name: 'deployment', required: true })
  @ApiQuery({ name: 'cluster', required: false })
  list(
    @Query('namespace') namespace: string,
    @Query('deployment') deployment: string,
  ): Promise<PodSummary[]> {
    return this.podsService.listByDeployment(namespace, deployment);
  }

  @Get(':name/logs')
  @SkipThrottle()
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE)
  @ApiQuery({ name: 'namespace', required: true })
  @ApiQuery({ name: 'deployment', required: true })
  @ApiQuery({ name: 'container', required: false })
  @ApiQuery({ name: 'cluster', required: false })
  @ApiParam({ name: 'name' })
  async streamLogs(
    @Query('namespace') namespace: string,
    @Query('deployment') deployment: string,
    @Query('container') container: string | undefined,
    @Param('name') name: string,
    @Res() response: Response,
  ) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();
    this.streamRegistry.register(response);

    const sendEvent = (data: string) => {
      response.write(`data: ${JSON.stringify({ line: data })}\n\n`);
    };

    await this.podsService.streamLogs(
      namespace,
      deployment,
      name,
      container,
      sendEvent,
      () => response.end(),
      (error) => {
        response.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
        response.end();
      },
    );
  }

  @Delete(':name')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE)
  @ApiQuery({ name: 'namespace', required: true })
  @ApiQuery({ name: 'deployment', required: true })
  @ApiParam({ name: 'name' })
  delete(
    @Query('namespace') namespace: string,
    @Query('deployment') deployment: string,
    @Param('name') name: string,
  ) {
    return this.podsService.deletePod(namespace, deployment, name);
  }

  @Post(':name/restart')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE)
  @ApiQuery({ name: 'namespace', required: true })
  @ApiQuery({ name: 'deployment', required: true })
  @ApiParam({ name: 'name' })
  restart(
    @Query('namespace') namespace: string,
    @Query('deployment') deployment: string,
    @Param('name') name: string,
  ) {
    return this.podsService.restartPod(namespace, deployment, name);
  }
}
