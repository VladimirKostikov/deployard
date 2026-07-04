import { Injectable } from '@nestjs/common';
import { K8sService } from '../../k8s/k8s.service';
import { HealthResponseDto } from './dto/health-response.dto';
import { ReadyResponseDto } from './dto/ready-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly k8sService: K8sService) {}

  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getReady(): ReadyResponseDto {
    const isReady = this.k8sService.isReady();

    return {
      status: isReady ? 'ready' : 'not_ready',
      k8s: isReady,
      timestamp: new Date().toISOString(),
    };
  }
}
