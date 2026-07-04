import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { Writable } from 'stream';
import { K8sService } from '../k8s.service';

@Injectable()
export class PodLogsStreamer {
  constructor(private readonly k8sService: K8sService) {}

  async stream(
    namespace: string,
    podName: string,
    container: string | undefined,
    onChunk: (chunk: string) => void,
    onEnd: () => void,
    onError: (error: Error) => void,
  ) {
    const log = new k8s.Log(this.k8sService.getKubeConfig());

    try {
      const stream = new Writable({
        write(chunk, _encoding, callback) {
          onChunk(chunk.toString());
          callback();
        },
      });

      stream.on('error', onError);
      stream.on('finish', onEnd);

      await log.log(namespace, podName, container ?? '', stream, {
        follow: true,
        tailLines: 200,
        pretty: false,
        timestamps: true,
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Log stream failed'));
    }
  }
}
