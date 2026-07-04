import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthUser } from '@dpd/shared';
import { AuthService, JwtPayload } from '../auth.service';
import { ACCESS_TOKEN_COOKIE } from '../cookie/auth-cookie.service';
import { parseCookieHeader } from '../cookie/parse-cookie-header';

export const WS_USER_KEY = 'user';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const existingUser = client.data[WS_USER_KEY] as AuthUser | undefined;

    if (existingUser) {
      return true;
    }

    const cookies = parseCookieHeader(client.handshake.headers.cookie);
    const token = cookies[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new WsException('Authentication required');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new WsException('Authentication required');
    }

    const user = await this.authService.validatePayload(payload);
    client.data[WS_USER_KEY] = user;

    return true;
  }
}
