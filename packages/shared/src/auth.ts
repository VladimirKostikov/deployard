import type { SectionAccess } from './access-control';

export type { SectionAccess };
export {
  AppSection,
  AccessLevel,
  APP_SECTIONS,
  ACCESS_LEVELS,
  hasAccessLevel,
  buildSectionAccessKey,
} from './access-control';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  access: SectionAccess[];
}

export interface LoginRequest {
  email: string;
  password: string;
}
