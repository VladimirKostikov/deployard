import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApiErrorCode, POD_FILE_MAX_BYTES, PodFileContentResult, PodFileListResult } from '@dpd/shared';
import { parseLsOutput } from '../files/parse-ls-output';
import { joinPodPath, resolvePodPath, shellQuote } from '../files/resolve-pod-path';
import { PodExecCommandService } from '../streamers/pod-exec-command.service';

interface PodFileTarget {
  cluster?: string;
  namespace: string;
  podName: string;
  container?: string;
}

@Injectable()
export class PodFilesService {
  constructor(private readonly execCommand: PodExecCommandService) {}

  async listDirectory(target: PodFileTarget, path: string): Promise<PodFileListResult> {
    const directory = resolvePodPath(path);
    const quoted = shellQuote(directory);
    const result = await this.execCommand.runShell(
      target.cluster,
      target.namespace,
      target.podName,
      target.container,
      `if [ ! -d ${quoted} ]; then exit 3; fi; ls -la -- ${quoted}`,
    );

    if (result.exitCode === 3) {
      throw new NotFoundException({ code: ApiErrorCode.POD_NOT_FOUND, message: 'Directory not found' });
    }

    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr.trim() || 'Failed to list directory');
    }

    return {
      path: directory,
      entries: parseLsOutput(directory, result.stdout),
    };
  }

  async readFile(target: PodFileTarget, path: string): Promise<PodFileContentResult> {
    const filePath = resolvePodPath(path);
    const quoted = shellQuote(filePath);
    const sizeResult = await this.execCommand.runShell(
      target.cluster,
      target.namespace,
      target.podName,
      target.container,
      `if [ ! -f ${quoted} ]; then exit 3; fi; wc -c < ${quoted}`,
    );

    if (sizeResult.exitCode === 3) {
      throw new NotFoundException({ code: ApiErrorCode.POD_NOT_FOUND, message: 'File not found' });
    }

    const size = Number(sizeResult.stdout.trim());
    if (!Number.isFinite(size)) {
      throw new BadRequestException('Failed to read file size');
    }

    if (size > POD_FILE_MAX_BYTES) {
      throw new BadRequestException(`File exceeds ${POD_FILE_MAX_BYTES} bytes limit`);
    }

    const contentResult = await this.execCommand.runShell(
      target.cluster,
      target.namespace,
      target.podName,
      target.container,
      `base64 ${quoted} | tr -d '\\n'`,
    );

    if (contentResult.exitCode !== 0) {
      throw new BadRequestException(contentResult.stderr.trim() || 'Failed to read file');
    }

    const buffer = Buffer.from(contentResult.stdout.trim(), 'base64');
    const isText = !buffer.includes(0);

    return {
      path: filePath,
      size,
      encoding: isText ? 'utf-8' : 'base64',
      content: isText ? buffer.toString('utf-8') : buffer.toString('base64'),
    };
  }

  async writeFile(target: PodFileTarget, path: string, contentBase64: string): Promise<{ ok: true }> {
    const filePath = resolvePodPath(path);
    const buffer = Buffer.from(contentBase64, 'base64');

    if (buffer.length > POD_FILE_MAX_BYTES) {
      throw new BadRequestException(`File exceeds ${POD_FILE_MAX_BYTES} bytes limit`);
    }

    const quotedPath = shellQuote(filePath);
    const quotedData = shellQuote(buffer.toString('base64'));
    const result = await this.execCommand.runShell(
      target.cluster,
      target.namespace,
      target.podName,
      target.container,
      `printf '%s' ${quotedData} | base64 -d > ${quotedPath}`,
    );

    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr.trim() || 'Failed to write file');
    }

    return { ok: true };
  }

  async createDirectory(target: PodFileTarget, path: string): Promise<{ ok: true }> {
    const directory = resolvePodPath(path);
    const result = await this.execCommand.runShell(
      target.cluster,
      target.namespace,
      target.podName,
      target.container,
      `mkdir -p ${shellQuote(directory)}`,
    );

    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr.trim() || 'Failed to create directory');
    }

    return { ok: true };
  }

  async deletePath(target: PodFileTarget, path: string): Promise<{ ok: true }> {
    const targetPath = resolvePodPath(path);

    if (targetPath === '/') {
      throw new BadRequestException('Cannot delete root path');
    }

    const quoted = shellQuote(targetPath);
    const result = await this.execCommand.runShell(
      target.cluster,
      target.namespace,
      target.podName,
      target.container,
      `if [ ! -e ${quoted} ]; then exit 3; fi; rm -rf ${quoted}`,
    );

    if (result.exitCode === 3) {
      throw new NotFoundException({ code: ApiErrorCode.POD_NOT_FOUND, message: 'Path not found' });
    }

    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr.trim() || 'Failed to delete path');
    }

    return { ok: true };
  }

  async renamePath(target: PodFileTarget, fromPath: string, toPath: string): Promise<{ ok: true }> {
    const source = resolvePodPath(fromPath);
    const destination = resolvePodPath(toPath);

    if (source === '/') {
      throw new BadRequestException('Cannot rename root path');
    }

    const result = await this.execCommand.runShell(
      target.cluster,
      target.namespace,
      target.podName,
      target.container,
      `mv ${shellQuote(source)} ${shellQuote(destination)}`,
    );

    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr.trim() || 'Failed to rename path');
    }

    return { ok: true };
  }

  buildChildPath(directory: string, name: string): string {
    return joinPodPath(directory, name);
  }
}
