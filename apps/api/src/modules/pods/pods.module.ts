import { Module } from '@nestjs/common';
import { PodWatchService } from '../../k8s/watchers/pod-watch.service';
import { ExecGateway } from './exec.gateway';
import { PodFilesController } from './pod-files.controller';
import { PodsController } from './pods.controller';
import { PodsGateway } from './pods.gateway';
import { PodsService } from './pods.service';

@Module({
  controllers: [PodsController, PodFilesController],
  providers: [PodsService, PodsGateway, ExecGateway, PodWatchService],
})
export class PodsModule {}
