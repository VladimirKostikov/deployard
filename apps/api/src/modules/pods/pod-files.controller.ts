import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccessLevel, AppSection, PodFileContentResult, PodFileListResult } from '@dpd/shared';
import { Response } from 'express';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { CreatePodDirectoryDto, RenamePodPathDto, WritePodFileDto } from './dto/pod-files.dto';
import { PodFilePathQueryDto } from './dto/pod-file-path-query.dto';
import { PodsService } from './pods.service';

@ApiTags('pods')
@Controller('pods')
export class PodFilesController {
  constructor(private readonly podsService: PodsService) {}

  @Get(':name/files')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.VIEW)
  @ApiParam({ name: 'name' })
  listFiles(
    @Param('name') podName: string,
    @Query() query: PodFilePathQueryDto,
  ): Promise<PodFileListResult> {
    return this.podsService.listPodFiles(query.namespace, query.deployment, podName, query);
  }

  @Get(':name/files/content')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.VIEW)
  @ApiParam({ name: 'name' })
  readFile(
    @Param('name') podName: string,
    @Query() query: PodFilePathQueryDto,
  ): Promise<PodFileContentResult> {
    return this.podsService.readPodFile(query.namespace, query.deployment, podName, query);
  }

  @Get(':name/files/download')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.VIEW)
  @ApiParam({ name: 'name' })
  async downloadFile(
    @Param('name') podName: string,
    @Query() query: PodFilePathQueryDto,
    @Res() response: Response,
  ) {
    const file = await this.podsService.readPodFile(query.namespace, query.deployment, podName, query);
    const fileName = file.path.split('/').pop() ?? 'download';
    const buffer =
      file.encoding === 'base64' ? Buffer.from(file.content, 'base64') : Buffer.from(file.content, 'utf-8');

    response.setHeader('Content-Type', 'application/octet-stream');
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    response.send(buffer);
  }

  @Put(':name/files/content')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE)
  @ApiParam({ name: 'name' })
  writeFile(@Param('name') podName: string, @Body() body: WritePodFileDto) {
    return this.podsService.writePodFile(body.namespace, body.deployment, podName, body);
  }

  @Post(':name/files/directories')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE)
  @ApiParam({ name: 'name' })
  createDirectory(@Param('name') podName: string, @Body() body: CreatePodDirectoryDto) {
    return this.podsService.createPodDirectory(body.namespace, body.deployment, podName, body);
  }

  @Delete(':name/files')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE)
  @ApiParam({ name: 'name' })
  deletePath(@Param('name') podName: string, @Query() query: PodFilePathQueryDto) {
    return this.podsService.deletePodPath(query.namespace, query.deployment, podName, query);
  }

  @Patch(':name/files/rename')
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.OPERATE)
  @ApiParam({ name: 'name' })
  renamePath(@Param('name') podName: string, @Body() body: RenamePodPathDto) {
    return this.podsService.renamePodPath(body.namespace, body.deployment, podName, body);
  }
}
