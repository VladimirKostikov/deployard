import { ExecutionContext, SetMetadata, createParamDecorator } from '@nestjs/common';
import { AccessLevel, AppSection, AuthUser } from '@dpd/shared';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const REQUIRE_ACCESS_KEY = 'requireAccess';

export interface AccessRequirement {
  section: AppSection;
  level: AccessLevel;
}

export const RequireAccess = (section: AppSection, level: AccessLevel) =>
  SetMetadata(REQUIRE_ACCESS_KEY, { section, level } satisfies AccessRequirement);

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser => {
  const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
  return request.user;
});
