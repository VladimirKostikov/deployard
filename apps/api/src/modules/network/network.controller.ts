import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccessLevel, AppSection, EndpointSummary, ServiceAccessResult, ServiceSummary, ServiceTunnelSummary } from '@dpd/shared';
import { Request } from 'express';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { CreateServiceDto } from './dto/create-service.dto';
import { StartServiceTunnelDto } from './dto/start-service-tunnel.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { NetworkService } from './network.service';

@ApiTags('network')
@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('services')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  @ApiQuery({ name: 'namespace', required: true })
  listServices(@Query('namespace') namespace: string): Promise<ServiceSummary[]> {
    return this.networkService.listServices(namespace);
  }

  @Get('services/by-deployment')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  @ApiQuery({ name: 'namespace', required: true })
  @ApiQuery({ name: 'deployment', required: true })
  listServicesForDeployment(
    @Query('namespace') namespace: string,
    @Query('deployment') deployment: string,
  ): Promise<ServiceSummary[]> {
    return this.networkService.listServicesForDeployment(namespace, deployment);
  }

  @Post('services')
  @RequireAccess(AppSection.NETWORK, AccessLevel.MANAGE)
  createService(@Body() dto: CreateServiceDto): Promise<ServiceSummary> {
    return this.networkService.createService(dto);
  }

  @Patch('services/:name')
  @RequireAccess(AppSection.NETWORK, AccessLevel.MANAGE)
  @ApiQuery({ name: 'namespace', required: true })
  @ApiParam({ name: 'name' })
  updateService(
    @Query('namespace') namespace: string,
    @Param('name') name: string,
    @Body() body: Omit<UpdateServiceDto, 'namespace' | 'name'>,
  ): Promise<ServiceSummary> {
    return this.networkService.updateService({ namespace, name, ...body });
  }

  @Delete('services/:name')
  @RequireAccess(AppSection.NETWORK, AccessLevel.MANAGE)
  @ApiQuery({ name: 'namespace', required: true })
  @ApiParam({ name: 'name' })
  deleteService(
    @Query('namespace') namespace: string,
    @Param('name') name: string,
  ): Promise<{ ok: true }> {
    return this.networkService.deleteService(namespace, name).then(() => ({ ok: true as const }));
  }

  @Get('endpoints')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  @ApiQuery({ name: 'namespace', required: true })
  listEndpoints(@Query('namespace') namespace: string): Promise<EndpointSummary[]> {
    return this.networkService.listEndpoints(namespace);
  }

  @Post('services/access')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  ensureServiceAccess(
    @Body() dto: StartServiceTunnelDto,
    @Req() request: Request,
  ): Promise<ServiceAccessResult> {
    const clusterHeader = request.headers['x-k8s-cluster'];
    const cluster = typeof clusterHeader === 'string' ? clusterHeader : undefined;
    return this.networkService.ensureServiceAccess(dto, cluster);
  }

  @Post('services/access/prepare')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  prepareServiceAccess(
    @Body() dto: StartServiceTunnelDto,
    @Req() request: Request,
  ): Promise<ServiceAccessResult> {
    const clusterHeader = request.headers['x-k8s-cluster'];
    const cluster = typeof clusterHeader === 'string' ? clusterHeader : undefined;
    return this.networkService.prepareServiceAccess(dto, cluster);
  }

  @Get('tunnels')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  listTunnels(): ServiceTunnelSummary[] {
    return this.networkService.listTunnels();
  }

  @Post('tunnels')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  startTunnel(
    @Body() dto: StartServiceTunnelDto,
    @Req() request: Request,
  ): Promise<ServiceTunnelSummary> {
    const clusterHeader = request.headers['x-k8s-cluster'];
    const cluster = typeof clusterHeader === 'string' ? clusterHeader : undefined;
    return this.networkService.startTunnel(dto, cluster);
  }

  @Delete('tunnels/:id')
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  @ApiParam({ name: 'id' })
  stopTunnel(@Param('id') id: string): Promise<{ ok: true }> {
    this.networkService.stopTunnel(id);
    return Promise.resolve({ ok: true as const });
  }
}
