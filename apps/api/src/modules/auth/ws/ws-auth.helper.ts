import { ForbiddenException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AccessLevel, ApiErrorCode, AppSection, AuthUser } from '@dpd/shared';
import { Socket } from 'socket.io';
import { PermissionChecker } from '../permission-checker.service';
import { WS_USER_KEY } from '../guards/ws-jwt.guard';

export function getWsUser(client: Socket): AuthUser {
  const user = client.data[WS_USER_KEY] as AuthUser | undefined;

  if (!user) {
    throw new WsException('Authentication required');
  }

  return user;
}

export function assertWsAccess(
  checker: PermissionChecker,
  user: AuthUser,
  section: AppSection,
  level: AccessLevel,
  namespace: string,
) {
  if (!checker.canAccess(user, section, level, namespace)) {
    throw new WsException('Insufficient permissions');
  }
}

export function assertHttpAccess(
  checker: PermissionChecker,
  user: AuthUser,
  section: AppSection,
  level: AccessLevel,
  namespace: string,
) {
  if (!checker.canAccess(user, section, level, namespace)) {
    throw new ForbiddenException({
      code: ApiErrorCode.FORBIDDEN,
      message: 'Insufficient permissions',
    });
  }
}
