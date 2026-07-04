import { Injectable } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'node:http';
import { EndpointSummary, ServiceAccessResult, ServiceSummary, ServiceTunnelSummary } from '@dpd/shared';
import { EndpointsRepository } from '../../k8s/repositories/endpoints.repository';
import { ServicesRepository } from '../../k8s/repositories/services.repository';
import { CreateServiceDto } from './dto/create-service.dto';
import { StartServiceTunnelDto } from './dto/start-service-tunnel.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceTunnelService } from './service-tunnel.service';
import { ServiceBrowserAccessService } from './service-browser-access.service';

@Injectable()
export class NetworkService {
  constructor(
    private readonly servicesRepository: ServicesRepository,
    private readonly endpointsRepository: EndpointsRepository,
    private readonly tunnelService: ServiceTunnelService,
    private readonly browserAccessService: ServiceBrowserAccessService,
  ) {}

  listServices(namespace: string): Promise<ServiceSummary[]> {
    return this.servicesRepository.list(namespace);
  }

  listServicesForDeployment(namespace: string, deploymentName: string): Promise<ServiceSummary[]> {
    return this.servicesRepository.listForDeployment(namespace, deploymentName);
  }

  listEndpoints(namespace: string): Promise<EndpointSummary[]> {
    return this.endpointsRepository.list(namespace);
  }

  createService(dto: CreateServiceDto): Promise<ServiceSummary> {
    return this.servicesRepository.createForDeployment(
      dto.namespace,
      dto.name,
      dto.deploymentName,
      dto.port,
      dto.targetPort,
    );
  }

  updateService(dto: UpdateServiceDto): Promise<ServiceSummary> {
    return this.servicesRepository.update(dto.namespace, dto.name, {
      type: dto.type,
      ports: dto.ports,
    });
  }

  deleteService(namespace: string, name: string): Promise<void> {
    return this.servicesRepository.delete(namespace, name);
  }

  listTunnels(): ServiceTunnelSummary[] {
    return this.tunnelService.list();
  }

  startTunnel(dto: StartServiceTunnelDto, cluster?: string): Promise<ServiceTunnelSummary> {
    return this.tunnelService.start(dto.namespace, dto.serviceName, dto.servicePort, cluster);
  }

  stopTunnel(id: string): void {
    this.tunnelService.stop(id);
  }

  proxyTunnel(id: string, req: IncomingMessage, res: ServerResponse): void {
    this.tunnelService.proxy(id, req, res);
  }

  ensureServiceAccess(
    dto: StartServiceTunnelDto,
    cluster?: string,
  ): Promise<ServiceAccessResult> {
    return this.browserAccessService.ensureAccess(
      dto.namespace,
      dto.serviceName,
      dto.servicePort,
      cluster,
    );
  }

  prepareServiceAccess(
    dto: StartServiceTunnelDto,
    cluster?: string,
  ): Promise<ServiceAccessResult> {
    return this.browserAccessService.prepareAccess(
      dto.namespace,
      dto.serviceName,
      dto.servicePort,
      cluster,
    );
  }
}
