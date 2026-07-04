import { ForbiddenException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessLevel, AppSection, AuthUser } from '@dpd/shared';
import type { NextFunction, Request, Response } from 'express';
import { AuthService, JwtPayload } from '../auth/auth.service';
import { ACCESS_TOKEN_COOKIE } from '../auth/cookie/auth-cookie.service';
import { PermissionChecker } from '../auth/permission-checker.service';
import { NetworkService } from './network.service';
import { resolveTunnelProxyPath } from './tunnel-proxy-path';

const TUNNEL_PROXY_PATTERN = /^\/api\/network\/tunnels\/([^/]+)\/proxy(\/|$)/;

@Injectable()
export class TunnelProxyMiddleware implements NestMiddleware {
  constructor(
    private readonly networkService: NetworkService,
    private readonly permissionChecker: PermissionChecker,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const match = TUNNEL_PROXY_PATTERN.exec(req.path);
    if (!match) {
      next();
      return;
    }

    const tunnelId = match[1];

    void this.authenticate(req)
      .then((user) => {
        if (!this.permissionChecker.canAccess(user, AppSection.NETWORK, AccessLevel.VIEW)) {
          throw new ForbiddenException({ message: 'Insufficient permissions' });
        }

        req.url = resolveTunnelProxyPath(req.originalUrl, tunnelId);
        this.networkService.proxyTunnel(tunnelId, req, res);
      })
      .catch((error: unknown) => {
        next(error);
      });
  }

  private async authenticate(request: Request): Promise<AuthUser> {
    const token = request.cookies?.[ACCESS_TOKEN_COOKIE];
    if (!token) {
      throw new UnauthorizedException({ message: 'Authentication required' });
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    return this.authService.validatePayload(payload);
  }
}
