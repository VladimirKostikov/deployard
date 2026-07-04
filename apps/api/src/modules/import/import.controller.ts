import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  ClusterImageLoadResult,
  ComposeBuildResult,
  ComposeImportPreview,
  ComposeImportResult,
  ComposeProjectDiscoveryResult,
  ComposeUpResult,
  DockerScanResult,
  ImportEnvironmentStatus,
  AccessLevel,
  AppSection,
} from '@dpd/shared';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { ComposeImportDto, DockerProjectImportDto } from './dto/compose-import.dto';
import { ClusterImageLoadDto, ComposeBuildDto } from './dto/import-actions.dto';
import { ProjectImportDto } from './dto/project-import.dto';
import { ImportService } from './import.service';

@ApiTags('import')
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Get('environment')
  @RequireAccess(AppSection.IMPORT, AccessLevel.VIEW)
  getEnvironment(): ImportEnvironmentStatus {
    return this.importService.getEnvironmentStatus();
  }

  @Get('projects')
  @RequireAccess(AppSection.IMPORT, AccessLevel.VIEW)
  discoverProjects(): ComposeProjectDiscoveryResult {
    return this.importService.discoverProjects();
  }

  @Post('projects/preview')
  @RequireAccess(AppSection.IMPORT, AccessLevel.VIEW)
  previewProject(@Body() dto: ProjectImportDto): Promise<ComposeImportPreview> {
    return this.importService.previewProject(
      dto.projectId,
      dto.namespace,
      dto.imageOverrides ?? {},
      dto.exposeHostPorts ?? false,
    );
  }

  @Post('projects/apply')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  applyProject(@Body() dto: ProjectImportDto): Promise<ComposeImportResult> {
    return this.importService.applyProject(
      dto.projectId,
      dto.namespace,
      dto.imageOverrides ?? {},
      dto.exposeHostPorts ?? false,
      dto.skipImagePrepare ?? false,
    );
  }

  @Post('projects/build')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  buildProject(@Body() dto: ComposeBuildDto): ComposeBuildResult {
    return this.importService.buildProject(dto.projectId, dto.imageOverrides ?? {});
  }

  @Post('projects/up')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  upProject(@Body() dto: ComposeBuildDto): ComposeUpResult {
    return this.importService.upProject(dto.projectId, dto.imageOverrides ?? {});
  }

  @Post('projects/up/stream')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  upProjectStream(@Body() dto: ComposeBuildDto, @Res() response: Response) {
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    let cancelled = false;

    try {
      const stream = this.importService.streamUpProject(
        dto.projectId,
        dto.imageOverrides ?? {},
        {
          onLine: (line, streamKind) => {
            if (cancelled) {
              return;
            }
            response.write(`data: ${JSON.stringify({ line, stream: streamKind })}\n\n`);
          },
          onComplete: (result) => {
            if (cancelled) {
              return;
            }
            response.write(`event: complete\ndata: ${JSON.stringify(result)}\n\n`);
            response.end();
          },
          onError: (error) => {
            if (cancelled) {
              return;
            }
            response.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
            response.end();
          },
        },
        {
          namespace: dto.namespace,
          partOf: dto.partOf,
          syncToCluster: dto.syncToCluster,
          clusterContext: dto.clusterContext,
        },
      );

      response.on('close', () => {
        cancelled = true;
        stream.cancel();
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Compose up failed';
      response.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
      response.end();
    }
  }

  @Post('projects/stop')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  stopProject(@Body() dto: ComposeBuildDto): Promise<ComposeUpResult> {
    return this.importService.stopProject(dto.projectId);
  }

  @Post('projects/down')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  downProject(@Body() dto: ComposeBuildDto): Promise<ComposeUpResult> {
    return this.importService.downProject(dto.projectId);
  }

  @Post('images/load-cluster')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  loadImagesToCluster(@Body() dto: ClusterImageLoadDto): ClusterImageLoadResult {
    return this.importService.loadImagesToCluster(
      dto.images,
      dto.projectId,
      dto.imageOverrides ?? {},
      dto.projectName,
    );
  }

  @Get('docker/projects')
  @RequireAccess(AppSection.IMPORT, AccessLevel.VIEW)
  scanDockerProjects(): DockerScanResult {
    return this.importService.scanDockerProjects();
  }

  @Post('compose/preview')
  @RequireAccess(AppSection.IMPORT, AccessLevel.VIEW)
  previewCompose(@Body() dto: ComposeImportDto): ComposeImportPreview {
    return this.importService.previewCompose(dto);
  }

  @Post('compose/apply')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  applyCompose(@Body() dto: ComposeImportDto): Promise<ComposeImportResult> {
    return this.importService.applyCompose(dto);
  }

  @Post('docker/preview')
  @RequireAccess(AppSection.IMPORT, AccessLevel.VIEW)
  previewDockerProject(@Body() dto: DockerProjectImportDto): Promise<ComposeImportPreview> {
    return this.importService.previewDockerProject(
      dto.projectName,
      dto.namespace,
      dto.imageOverrides ?? {},
      dto.exposeHostPorts ?? false,
    );
  }

  @Post('docker/apply')
  @RequireAccess(AppSection.IMPORT, AccessLevel.MANAGE)
  applyDockerProject(@Body() dto: DockerProjectImportDto): Promise<ComposeImportResult> {
    return this.importService.applyDockerProject(
      dto.projectName,
      dto.namespace,
      dto.imageOverrides ?? {},
      dto.exposeHostPorts ?? false,
    );
  }
}
