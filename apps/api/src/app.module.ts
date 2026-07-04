import path from 'node:path';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { StreamsModule } from './common/streams/streams.module';
import { SecurityModule } from './common/security/security.module';
import { AdminModule } from './modules/admin/admin.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClustersModule } from './modules/clusters/clusters.module';
import { HealthModule } from './modules/health/health.module';
import { IngressModule } from './modules/ingress/ingress.module';
import { NetworkModule } from './modules/network/network.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { NamespacesModule } from './modules/namespaces/namespaces.module';
import { PodsModule } from './modules/pods/pods.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ImportModule } from './modules/import/import.module';
import { UsersModule } from './modules/users/users.module';
import { K8sModule } from './k8s/k8s.module';
import { ClusterContextInterceptor } from './k8s/interceptors/cluster-context.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 120 },
      { name: 'webhook', ttl: 60_000, limit: 30 },
    ]),
    DatabaseModule,
    SecurityModule,
    UsersModule,
    K8sModule,
    StreamsModule,
    AuthModule,
    AdminModule,
    HealthModule,
    MetricsModule,
    ClustersModule,
    NamespacesModule,
    IngressModule,
    NetworkModule,
    DeploymentsModule,
    PodsModule,
    WebhooksModule,
    ImportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClusterContextInterceptor,
    },
  ],
})
export class AppModule {}
