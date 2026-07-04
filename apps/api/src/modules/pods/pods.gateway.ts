import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AccessLevel, AppSection } from '@dpd/shared';
import { Socket } from 'socket.io';
import { PodWatchService, PodWatchEvent } from '../../k8s/watchers/pod-watch.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { PermissionChecker } from '../auth/permission-checker.service';
import { assertWsAccess, getWsUser } from '../auth/ws/ws-auth.helper';

interface PodSubscribePayload {
  namespace: string;
  deployment: string;
  cluster?: string;
}

const wsCorsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  namespace: '/pods',
  path: '/api/ws',
  cors: { origin: wsCorsOrigin, credentials: true },
})
export class PodsGateway implements OnGatewayDisconnect {
  private readonly stopHandlers = new Map<string, () => void>();

  constructor(
    private readonly podWatchService: PodWatchService,
    private readonly permissionChecker: PermissionChecker,
  ) {}

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PodSubscribePayload,
  ) {
    const user = getWsUser(client);
    assertWsAccess(
      this.permissionChecker,
      user,
      AppSection.DEPLOYMENTS,
      AccessLevel.VIEW,
      payload.namespace,
    );

    this.unsubscribe(client.id);

    const stop = await this.podWatchService.watchDeploymentPods(
      payload.namespace,
      payload.deployment,
      payload.cluster,
      (event: PodWatchEvent) => client.emit('pod', event),
      (error: Error) => client.emit('error', { message: error.message }),
    );

    this.stopHandlers.set(client.id, stop);
    client.emit('subscribed', { namespace: payload.namespace, deployment: payload.deployment });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket) {
    getWsUser(client);
    this.unsubscribe(client.id);
    client.emit('unsubscribed');
  }

  handleDisconnect(client: Socket) {
    this.unsubscribe(client.id);
  }

  private unsubscribe(clientId: string) {
    const stop = this.stopHandlers.get(clientId);
    if (stop) {
      stop();
      this.stopHandlers.delete(clientId);
    }
  }
}
