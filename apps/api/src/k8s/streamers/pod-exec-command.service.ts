import { PassThrough, Writable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { K8sService } from '../k8s.service';

export interface PodExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

@Injectable()
export class PodExecCommandService {
  constructor(private readonly k8sService: K8sService) {}

  run(
    cluster: string | undefined,
    namespace: string,
    podName: string,
    container: string | undefined,
    command: string[],
  ): Promise<PodExecResult> {
    return this.k8sService.runInCluster(cluster, () => this.exec(namespace, podName, container, command));
  }

  private exec(
    namespace: string,
    podName: string,
    container: string | undefined,
    command: string[],
  ): Promise<PodExecResult> {
    const kubeConfig = this.k8sService.getKubeConfig();
    const exec = new k8s.Exec(kubeConfig);
    let stdout = '';
    let stderr = '';

    const stdoutStream = new Writable({
      write(chunk, _encoding, callback) {
        stdout += chunk.toString();
        callback();
      },
    });

    const stderrStream = new Writable({
      write(chunk, _encoding, callback) {
        stderr += chunk.toString();
        callback();
      },
    });

    return new Promise((resolve, reject) => {
      exec
        .exec(namespace, podName, container ?? '', command, stdoutStream, stderrStream, null, false, (status) => {
          const exitCode = status.status === 'Success' ? 0 : Number(status.code ?? 1);
          resolve({ stdout, stderr, exitCode });
        })
        .catch(reject);
    });
  }

  runShell(
    cluster: string | undefined,
    namespace: string,
    podName: string,
    container: string | undefined,
    script: string,
  ): Promise<PodExecResult> {
    return this.run(cluster, namespace, podName, container, ['sh', '-c', script]);
  }
}
