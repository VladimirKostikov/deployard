import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiErrorCode, AuthUser } from '@dpd/shared';
import {
  AccessRequirement,
  IS_PUBLIC_KEY,
  REQUIRE_ACCESS_KEY,
} from '../decorators/auth.decorators';
import { PermissionChecker } from '../permission-checker.service';
import { resolveRequestNamespace } from '../resolve-request-namespace';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionChecker: PermissionChecker,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requirement = this.reflector.getAllAndOverride<AccessRequirement>(REQUIRE_ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user: AuthUser;
      query: Record<string, unknown>;
      params: Record<string, unknown>;
      body?: Record<string, unknown>;
    }>();

    const user = request.user;
    if (!user) {
      return false;
    }

    const allowed = this.permissionChecker.canAccess(
      user,
      requirement.section,
      requirement.level,
      resolveRequestNamespace(request),
    );

    if (!allowed) {
      throw new ForbiddenException({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Insufficient permissions',
      });
    }

    return true;
  }
}
