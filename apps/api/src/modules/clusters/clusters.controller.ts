import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser, AccessLevel, AppSection, ClusterSummary } from '@dpd/shared';
import { ClusterAccessService } from '../../k8s/cluster-access.service';
import { CurrentUser, RequireAccess } from '../auth/decorators/auth.decorators';

@ApiTags('clusters')
@Controller('clusters')
export class ClustersController {
  constructor(private readonly clusterAccess: ClusterAccessService) {}

  @Get()
  @RequireAccess(AppSection.DEPLOYMENTS, AccessLevel.VIEW)
  list(@CurrentUser() user: AuthUser): ClusterSummary[] {
    return this.clusterAccess.listAccessibleClusters(user);
  }
}
