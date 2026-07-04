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
import { PodExecService, PodExecSession } from '../../k8s/streamers/pod-exec.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { PermissionChecker } from '../auth/permission-checker.service';
import { assertWsAccess, getWsUser } from '../auth/ws/ws-auth.helper';
import { PodsService } from './pods.service';

interface ExecStartPayload {
  namespace: string;
  pod: string;
  container?: string;
  cluster?: string;
  deployment: string;
}

const wsCorsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  namespace: '/exec',
  path: '/api/ws',
  cors: { origin: wsCorsOrigin, credentials: true },
})
export class ExecGateway implements OnGatewayDisconnect {
  private readonly sessions = new Map<string, PodExecSession>();

  constructor(
    private readonly podExecService: PodExecService,
    private readonly permissionChecker: PermissionChecker,
    private readonly podsService: PodsService,
  ) {}

  @SubscribeMessage('start')
  async handleStart(@ConnectedSocket() client: Socket, @MessageBody() payload: ExecStartPayload) {
    const user = getWsUser(client);
    assertWsAccess(
      this.permissionChecker,
      user,
      AppSection.DEPLOYMENTS,
      AccessLevel.OPERATE,
      payload.namespace,
    );

    await this.podsService.assertPodInDeployment(payload.namespace, payload.deployment, payload.pod);

    this.stopSession(client.id);

    const session = await this.podExecService.start(
      payload.cluster,
      payload.namespace,
      payload.pod,
      payload.container,
      {
        onStdout: (data) => client.emit('stdout', { data }),
        onStderr: (data) => client.emit('stderr', { data }),
        onClose: () => {
          client.emit('exit');
          this.sessions.delete(client.id);
        },
        onError: (error) => {
          client.emit('error', { message: error.message });
          this.sessions.delete(client.id);
        },
      },
    );

    this.sessions.set(client.id, session);
    client.emit('started', { pod: payload.pod });
  }

  @SubscribeMessage('stdin')
  handleStdin(@ConnectedSocket() client: Socket, @MessageBody() payload: { data: string }) {
    getWsUser(client);
    const session = this.sessions.get(client.id);
    session?.writeStdin(payload.data);
  }

  @SubscribeMessage('stop')
  handleStop(@ConnectedSocket() client: Socket) {
    getWsUser(client);
    this.stopSession(client.id);
    client.emit('exit');
  }

  handleDisconnect(client: Socket) {
    this.stopSession(client.id);
  }

  private stopSession(clientId: string) {
    const session = this.sessions.get(clientId);
    if (session) {
      session.close();
      this.sessions.delete(clientId);
    }
  }
}
