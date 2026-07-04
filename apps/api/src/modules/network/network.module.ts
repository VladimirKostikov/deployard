import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';
import { ServiceBrowserAccessService } from './service-browser-access.service';
import { ServiceTunnelService } from './service-tunnel.service';
import { TunnelProxyMiddleware } from './tunnel-proxy.middleware';

@Module({
  controllers: [NetworkController],
  providers: [NetworkService, ServiceTunnelService, ServiceBrowserAccessService, TunnelProxyMiddleware],
  exports: [ServiceBrowserAccessService],
})
export class NetworkModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TunnelProxyMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
