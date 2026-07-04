import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ApiErrorCode, PodSummary } from '@dpd/shared';
import { PodFilesService } from '../../k8s/files/pod-files.service';
import { PodLogsStreamer } from '../../k8s/streamers/pod-logs.streamer';
import { IPodsRepository, PODS_REPOSITORY } from '../../k8s/interfaces/pods.repository.interface';
import { CreatePodDirectoryDto, RenamePodPathDto, WritePodFileDto } from './dto/pod-files.dto';
import { PodFilePathQueryDto } from './dto/pod-file-path-query.dto';

@Injectable()
export class PodsService {
  constructor(
    @Inject(PODS_REPOSITORY)
    private readonly podsRepository: IPodsRepository,
    private readonly podLogsStreamer: PodLogsStreamer,
    private readonly podFilesService: PodFilesService,
  ) {}

  listByDeployment(namespace: string, deploymentName: string): Promise<PodSummary[]> {
    return this.podsRepository.listByDeployment(namespace, deploymentName);
  }

  async assertPodInDeployment(namespace: string, deploymentName: string, podName: string) {
    const belongs = await this.podsRepository.isPodInDeployment(namespace, deploymentName, podName);

    if (!belongs) {
      throw new ForbiddenException({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Pod does not belong to this deployment',
      });
    }
  }

  async deletePod(namespace: string, deploymentName: string, name: string) {
    await this.assertPodInDeployment(namespace, deploymentName, name);
    return this.podsRepository.deletePod(namespace, name).then(() => ({ ok: true }));
  }

  async restartPod(namespace: string, deploymentName: string, name: string) {
    await this.assertPodInDeployment(namespace, deploymentName, name);
    return this.podsRepository.deletePod(namespace, name).then(() => ({ ok: true }));
  }

  async streamLogs(
    namespace: string,
    deploymentName: string,
    podName: string,
    container: string | undefined,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: Error) => void,
  ) {
    await this.assertPodInDeployment(namespace, deploymentName, podName);
    return this.podLogsStreamer.stream(namespace, podName, container, onChunk, onEnd, onError);
  }

  listPodFiles(namespace: string, deploymentName: string, podName: string, query: PodFilePathQueryDto) {
    return this.withPodFilesTarget(namespace, deploymentName, podName, query, (target) =>
      this.podFilesService.listDirectory(target, query.path ?? '/'),
    );
  }

  readPodFile(namespace: string, deploymentName: string, podName: string, query: PodFilePathQueryDto) {
    return this.withPodFilesTarget(namespace, deploymentName, podName, query, (target) =>
      this.podFilesService.readFile(target, query.path ?? '/'),
    );
  }

  writePodFile(namespace: string, deploymentName: string, podName: string, body: WritePodFileDto) {
    return this.withPodFilesTarget(namespace, deploymentName, podName, body, (target) =>
      this.podFilesService.writeFile(target, body.path, body.contentBase64),
    );
  }

  createPodDirectory(
    namespace: string,
    deploymentName: string,
    podName: string,
    body: CreatePodDirectoryDto,
  ) {
    return this.withPodFilesTarget(namespace, deploymentName, podName, body, (target) =>
      this.podFilesService.createDirectory(target, body.path),
    );
  }

  deletePodPath(namespace: string, deploymentName: string, podName: string, query: PodFilePathQueryDto) {
    return this.withPodFilesTarget(namespace, deploymentName, podName, query, (target) =>
      this.podFilesService.deletePath(target, query.path ?? '/'),
    );
  }

  renamePodPath(namespace: string, deploymentName: string, podName: string, body: RenamePodPathDto) {
    return this.withPodFilesTarget(namespace, deploymentName, podName, body, (target) =>
      this.podFilesService.renamePath(target, body.fromPath, body.toPath),
    );
  }

  private async withPodFilesTarget<T>(
    namespace: string,
    deploymentName: string,
    podName: string,
    query: PodFilePathQueryDto,
    callback: (target: {
      cluster?: string;
      namespace: string;
      podName: string;
      container?: string;
    }) => Promise<T>,
  ) {
    await this.assertPodInDeployment(namespace, deploymentName, podName);
    return callback({
      cluster: query.cluster,
      namespace,
      podName,
      container: query.container,
    });
  }
}
