import { RevokedTokenEntity } from '../modules/auth/entities/revoked-token.entity';
import { PermissionEntity, RoleEntity, UserEntity } from '../modules/users/entities/user.entity';

export const authEntities = [UserEntity, RoleEntity, PermissionEntity, RevokedTokenEntity];
