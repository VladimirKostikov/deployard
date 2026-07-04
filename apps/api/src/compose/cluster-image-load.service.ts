import { execFileSync } from 'node:child_process';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClusterImageLoadResult } from '@dpd/shared';

@Injectable()
export class ClusterImageLoadService {
  constructor(private readonly configService: ConfigService) {}

  loadImages(images: string[]): ClusterImageLoadResult {
    const uniqueImages = [...new Set(images.map((image) => image.trim()).filter(Boolean))];
    if (uniqueImages.length === 0) {
      return { loaded: [], failed: [] };
    }

    this.ensureDocker();
    const controlPlane = this.resolveKindControlPlane();
    const loaded: string[] = [];
    const failed: Array<{ image: string; error: string }> = [];

    for (const image of uniqueImages) {
      try {
        this.importImage(image, controlPlane);
        loaded.push(image);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Image import failed';
        failed.push({ image, error: message });
      }
    }

    return { loaded, failed };
  }

  isKindAvailable(): boolean {
    try {
      this.ensureDocker();
      this.resolveKindControlPlane();
      return true;
    } catch {
      return false;
    }
  }

  getClusterName(): string {
    return this.configService.get<string>('KIND_CLUSTER_NAME', 'dpd-local');
  }

  private ensureDocker(): void {
    if (this.configService.get<string>('DOCKER_SCAN_ENABLED', 'false') !== 'true') {
      throw new Error('Docker is disabled');
    }

    execFileSync('docker', ['info'], { stdio: ['ignore', 'pipe', 'pipe'] });
  }

  private resolveKindControlPlane(): string {
    const clusterName = this.getClusterName();
    const output = execFileSync(
      'docker',
      [
        'ps',
        '--filter',
        `label=io.x-k8s.kind.cluster=${clusterName}`,
        '--filter',
        'name=control-plane',
        '--format',
        '{{.Names}}',
      ],
      { encoding: 'utf8' },
    ).trim();

    const containerName = output.split('\n').map((entry) => entry.trim()).find(Boolean);
    if (!containerName) {
      throw new Error(`kind control-plane container not found for cluster "${clusterName}"`);
    }

    return containerName;
  }

  private importImage(image: string, controlPlane: string): void {
    execFileSync('docker', ['image', 'inspect', image], { stdio: ['ignore', 'pipe', 'pipe'] });

    const saveOutput = execFileSync('docker', ['save', image], {
      encoding: 'buffer',
      maxBuffer: 512 * 1024 * 1024,
    });

    execFileSync('docker', ['exec', '-i', controlPlane, 'ctr', '-n=k8s.io', 'images', 'import', '-'], {
      input: saveOutput,
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 512 * 1024 * 1024,
    });
  }
}
