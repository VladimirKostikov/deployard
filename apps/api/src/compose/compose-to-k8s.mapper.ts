import { Injectable } from '@nestjs/common';
import {
  ComposeImportPreview,
  ComposeImportWarning,
  composeK8sResourceName,
  defaultLocalImageTag,
  isLocalClusterImage,
  mergeLocalImageOverrides,
  rewriteComposeServiceReferences,
} from '@dpd/shared';
import { ComposeParserService } from './compose-parser.service';
import { attachComposeNginxConfigs } from './compose-nginx-config';
import {
  ComposeK8sPlan,
  ComposeK8sServicePlan,
  ParsedComposeService,
} from './compose-plan.types';

@Injectable()
export class ComposeToK8sMapper {
  constructor(private readonly parser: ComposeParserService) {}

  buildPlan(
    composeYaml: string,
    namespace: string,
    imageOverrides: Record<string, string> = {},
    exposeHostPorts = false,
    projectName?: string,
  ): ComposeK8sPlan {
    const parsed = this.parser.parse(composeYaml, projectName);
    const buildServices = parsed.services
      .filter((service) => service.build)
      .map((service) => service.name);
    const mergedOverrides = mergeLocalImageOverrides(
      buildServices,
      imageOverrides,
      parsed.projectName,
    );
    const warnings: ComposeImportWarning[] = [];
    const services = parsed.services.map((service) =>
      this.mapService(
        service,
        parsed.namedVolumes,
        mergedOverrides,
        exposeHostPorts,
        warnings,
        parsed.projectName,
      ),
    );

    attachComposeNginxConfigs(services);
    this.rewriteProjectServiceReferences(services);
    this.sortServices(services, warnings);

    return {
      projectName: parsed.projectName,
      namespace,
      services,
      warnings,
    };
  }

  toPreview(plan: ComposeK8sPlan): ComposeImportPreview {
    return {
      projectName: plan.projectName,
      namespace: plan.namespace,
      warnings: plan.warnings,
      services: plan.services.map((service) => ({
        name: service.name,
        image: service.image,
        containerPort: service.containerPort,
        hostPort: service.hostPort,
        replicas: service.replicas,
        dependsOn: service.dependsOn,
        envKeys: Object.keys(service.environment),
        volumeNames: service.pvcNames,
        hasBuild: service.hasBuild,
        createService: service.createService,
        createSecret: Object.keys(service.environment).length > 0,
        createPvc: service.pvcNames.length > 0,
      })),
    };
  }

  private mapService(
    service: ParsedComposeService,
    namedVolumes: string[],
    imageOverrides: Record<string, string>,
    exposeHostPorts: boolean,
    warnings: ComposeImportWarning[],
    projectName: string,
  ): ComposeK8sServicePlan {
    const primaryPort = service.ports[0];
    const containerPort = primaryPort?.containerPort ?? this.inferContainerPort(service);
    const hostPort = primaryPort?.hostPort;
    const image = this.resolveImage(service, imageOverrides, warnings, projectName);
    const volumeMounts = this.mapVolumeMounts(service.volumes, namedVolumes, warnings);
    const pvcNames = [...new Set(volumeMounts.map((entry) => entry.name))];

    if (service.build && !imageOverrides[service.name]) {
      warnings.push({
        code: 'BUILD_REQUIRES_IMAGE',
        service: service.name,
        message: `Service "${service.name}" uses build; provide imageOverrides or pre-built image tag`,
      });
    }

    if (hostPort && exposeHostPorts) {
      warnings.push({
        code: 'HOST_PORT_NODEPORT',
        service: service.name,
        message: `Host port ${hostPort} will be exposed as NodePort when possible`,
      });
    }

    return {
      name: service.name,
      resourceName: composeK8sResourceName(projectName, service.name),
      image,
      containerPort,
      hostPort: exposeHostPorts ? hostPort : undefined,
      replicas: 1,
      dependsOn: service.dependsOn,
      environment: service.environment,
      volumeMounts,
      pvcNames,
      healthcheck: service.healthcheck,
      hasBuild: service.build ?? false,
      createService: service.ports.length > 0,
      localImage: isLocalClusterImage(image) || Boolean(service.build),
    };
  }

  private inferContainerPort(service: ParsedComposeService): number {
    const rawPort = service.environment.PORT ?? service.environment.port;
    if (rawPort) {
      const parsed = Number(rawPort);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return 80;
  }

  private rewriteProjectServiceReferences(services: ComposeK8sServicePlan[]): void {
    const composeNames = services.map((service) => service.name);
    const resourceByComposeName = new Map(
      services.map((service) => [service.name, service.resourceName]),
    );

    for (const service of services) {
      service.environment = rewriteComposeServiceReferences(
        service.environment,
        composeNames,
        (composeName) => resourceByComposeName.get(composeName) ?? composeName,
      );
    }
  }

  private resolveImage(
    service: ParsedComposeService,
    imageOverrides: Record<string, string>,
    warnings: ComposeImportWarning[],
    projectName: string,
  ): string {
    const override = imageOverrides[service.name]?.trim();
    if (override) {
      return override;
    }

    if (service.image?.trim()) {
      return service.image.trim();
    }

    const fallback = defaultLocalImageTag(service.name, projectName);
    warnings.push({
      code: 'DEFAULT_IMAGE_TAG',
      service: service.name,
      message: `Using fallback image "${fallback}" for service "${service.name}"`,
    });
    return fallback;
  }

  private mapVolumeMounts(
    volumeRefs: string[],
    namedVolumes: string[],
    warnings: ComposeImportWarning[],
  ): Array<{ name: string; mountPath: string }> {
    const mounts: Array<{ name: string; mountPath: string }> = [];

    for (const ref of volumeRefs) {
      const segments = ref.split(':');
      const source = segments[0]?.trim();
      const mountPath = segments[1]?.trim();

      if (!source || !mountPath) {
        continue;
      }

      if (!namedVolumes.includes(source)) {
        warnings.push({
          code: 'BIND_MOUNT_SKIPPED',
          service: source,
          message: `Bind mount "${ref}" is not supported; use named volumes`,
        });
        continue;
      }

      mounts.push({ name: source, mountPath });
    }

    return mounts;
  }

  private sortServices(
    services: ComposeK8sServicePlan[],
    warnings: ComposeImportWarning[],
  ): void {
    const order: string[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const byName = new Map(services.map((service) => [service.name, service]));

    const visit = (name: string) => {
      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        warnings.push({
          code: 'DEPENDS_ON_ORDER',
          service: name,
          message: `Circular depends_on detected near "${name}"; using best-effort order`,
        });
        return;
      }

      visiting.add(name);
      const service = byName.get(name);
      for (const dependency of service?.dependsOn ?? []) {
        if (byName.has(dependency)) {
          visit(dependency);
        }
      }
      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const service of services) {
      visit(service.name);
    }

    services.sort(
      (left, right) => order.indexOf(left.name) - order.indexOf(right.name),
    );
  }
}
