import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser, SectionAccess, buildSectionAccessKey, hasAccessLevel } from '@dpd/shared';
import { PermissionEntity, RoleEntity, UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string) {
    return this.usersRepository.findOne({ where: { id } });
  }

  findAll() {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  findAllRoles() {
    return this.rolesRepository.find({ order: { name: 'ASC' } });
  }

  findAllPermissions() {
    return this.permissionsRepository.find({ order: { section: 'ASC', level: 'ASC' } });
  }

  findRoleById(id: string) {
    return this.rolesRepository.findOne({ where: { id } });
  }

  findPermissionById(id: string) {
    return this.permissionsRepository.findOne({ where: { id } });
  }

  async countUsersWithRole(roleId: string) {
    const users = await this.findAll();
    return users.filter((user) => user.roles.some((role) => role.id === roleId)).length;
  }

  saveUser(user: UserEntity) {
    return this.usersRepository.save(user);
  }

  saveRole(role: RoleEntity) {
    return this.rolesRepository.save(role);
  }

  savePermission(permission: PermissionEntity) {
    return this.permissionsRepository.save(permission);
  }

  deleteUser(id: string) {
    return this.usersRepository.delete({ id });
  }

  deleteRole(id: string) {
    return this.rolesRepository.delete({ id });
  }

  deletePermission(id: string) {
    return this.permissionsRepository.delete({ id });
  }

  async resolveAccessPermissions(access: SectionAccess[]): Promise<PermissionEntity[]> {
    const existing = await this.findAllPermissions();
    const byKey = new Map(
      existing.map((permission) => [
        buildSectionAccessKey({
          section: permission.section as SectionAccess['section'],
          level: permission.level as SectionAccess['level'],
          namespace: permission.namespace,
        }),
        permission,
      ]),
    );

    const resolved: PermissionEntity[] = [];

    for (const grant of access) {
      const key = buildSectionAccessKey(grant);
      const found = byKey.get(key);

      if (found) {
        resolved.push(found);
        continue;
      }

      const created = await this.savePermission({
        section: grant.section,
        level: grant.level,
        namespace: grant.namespace,
      } as PermissionEntity);

      byKey.set(key, created);
      resolved.push(created);
    }

    return resolved;
  }

  toAuthUser(user: UserEntity): AuthUser {
    const access = new Map<string, SectionAccess>();

    for (const role of user.roles) {
      for (const permission of role.permissions) {
        if (!permission.level) {
          continue;
        }

        const grant: SectionAccess = {
          section: permission.section as SectionAccess['section'],
          level: permission.level as SectionAccess['level'],
          namespace: permission.namespace,
        };

        const key = buildSectionAccessKey(grant);
        const current = access.get(key);

        if (!current || hasAccessLevel(grant.level, current.level)) {
          access.set(key, grant);
        }
      }
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles.map((role) => role.name),
      access: [...access.values()],
    };
  }
}
