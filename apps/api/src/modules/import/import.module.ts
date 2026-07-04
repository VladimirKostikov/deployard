import { Module } from '@nestjs/common';
import { ComposeGroupSyncService } from '../../compose/compose-group-sync.service';
import { ComposeOrphanPruneService } from '../../compose/compose-orphan-prune.service';
import { ComposeDiscoveryService } from '../../compose/compose-discovery.service';
import { ComposeBuildService } from '../../compose/compose-build.service';
import { ClusterImageLoadService } from '../../compose/cluster-image-load.service';
import { ComposeParserService } from '../../compose/compose-parser.service';
import { ComposeToK8sMapper } from '../../compose/compose-to-k8s.mapper';
import { DockerScanService } from '../../compose/docker-scan.service';
import { ComposeImportApplyService } from './compose-import-apply.service';
import { ComposeImportSyncService } from './compose-import-sync.service';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({
  controllers: [ImportController],
  providers: [
    ImportService,
    ComposeImportApplyService,
    ComposeImportSyncService,
    ComposeGroupSyncService,
    ComposeOrphanPruneService,
    ComposeDiscoveryService,
    ComposeBuildService,
    ClusterImageLoadService,
    ComposeParserService,
    ComposeToK8sMapper,
    DockerScanService,
  ],
})
export class ImportModule {}
