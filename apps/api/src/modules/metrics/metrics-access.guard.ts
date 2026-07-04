import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiErrorCode, AuthUser } from '@dpd/shared';
import { Request } from 'express';
import { SecurityBootstrapService } from '../../common/security/security-bootstrap.service';
import { AuthService, JwtPayload } from '../auth/auth.service';
import { ACCESS_TOKEN_COOKIE } from '../auth/cookie/auth-cookie.service';
import { parseCookieHeader } from '../auth/cookie/parse-cookie-header';
import { TokenRevocationService } from '../auth/token-revocation.service';

@Injectable()
export class MetricsAccessGuard implements CanActivate {
  constructor(
    private readonly securityBootstrap: SecurityBootstrapService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly tokenRevocation: TokenRevocationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.securityBootstrap.isMetricsPublic()) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const cookies = parseCookieHeader(request.headers.cookie);
    const token = cookies[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new UnauthorizedException({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      });
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authentication required',
      });
    }

    if (await this.tokenRevocation.isRevoked(payload.jti)) {
      throw new UnauthorizedException({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Session expired',
      });
    }

    const user = await this.authService.validatePayload(payload);

    if (!user.roles.includes('admin')) {
      throw new ForbiddenException({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Insufficient permissions',
      });
    }

    request.user = user;
    return true;
  }
}
