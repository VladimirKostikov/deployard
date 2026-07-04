import { PassThrough, Writable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { K8sService } from '../k8s.service';

export interface PodExecSession {
  writeStdin: (data: string) => void;
  close: () => void;
}

@Injectable()
export class PodExecService {
  constructor(private readonly k8sService: K8sService) {}

  start(
    cluster: string | undefined,
    namespace: string,
    podName: string,
    container: string | undefined,
    handlers: {
      onStdout: (data: string) => void;
      onStderr: (data: string) => void;
      onClose: () => void;
      onError: (error: Error) => void;
    },
  ): Promise<PodExecSession> {
    return this.k8sService.runInCluster(cluster, async () => {
      const kubeConfig = this.k8sService.getKubeConfig();
      const exec = new k8s.Exec(kubeConfig);
      const stdin = new PassThrough();
      let closed = false;

      const stdout = new Writable({
        write(chunk, _encoding, callback) {
          handlers.onStdout(chunk.toString());
          callback();
        },
      });

      const stderr = new Writable({
        write(chunk, _encoding, callback) {
          handlers.onStderr(chunk.toString());
          callback();
        },
      });

      try {
        await exec.exec(
          namespace,
          podName,
          container ?? '',
          ['sh'],
          stdout,
          stderr,
          stdin,
          true,
          () => {
            if (!closed) {
              closed = true;
              handlers.onClose();
            }
          },
        );
      } catch (error) {
        handlers.onError(error instanceof Error ? error : new Error('Exec failed'));
      }

      return {
        writeStdin: (data: string) => {
          if (!closed) {
            stdin.write(data);
          }
        },
        close: () => {
          if (!closed) {
            closed = true;
            stdin.end();
            handlers.onClose();
          }
        },
      };
    });
  }
}
