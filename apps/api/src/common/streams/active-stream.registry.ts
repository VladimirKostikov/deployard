import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ActiveStreamRegistry implements OnApplicationShutdown {
  private readonly streams = new Set<Response>();

  register(response: Response) {
    this.streams.add(response);
    response.on('close', () => this.streams.delete(response));
  }

  onApplicationShutdown() {
    for (const response of this.streams) {
      if (!response.writableEnded) {
        response.end();
      }
    }
    this.streams.clear();
  }
}
