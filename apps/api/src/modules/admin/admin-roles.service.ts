import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { sanitizeAdminRole } from './admin.mapper';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class AdminRolesService {
  constructor(private readonly usersService: UsersService) {}

  async listRoles() {
    const roles = await this.usersService.findAllRoles();
    return roles.map((role) => sanitizeAdminRole(role));
  }

  async createRole(dto: CreateRoleDto) {
    const roles = await this.usersService.findAllRoles();
    if (roles.some((role) => role.name === dto.name)) {
      throw new ConflictException('Role name already exists');
    }

    const role = new RoleEntity();
    role.name = dto.name;
    role.permissions = dto.access?.length
      ? await this.usersService.resolveAccessPermissions(
          dto.access.map((grant) => ({
            section: grant.section,
            level: grant.level,
            namespace: grant.namespace ?? null,
          })),
        )
      : dto.permissionIds
        ? await this.loadPermissions(dto.permissionIds)
        : [];

    const saved = await this.usersService.saveRole(role);
    return sanitizeAdminRole(saved);
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const role = await this.usersService.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.name && dto.name !== role.name) {
      const roles = await this.usersService.findAllRoles();
      if (roles.some((item) => item.name === dto.name)) {
        throw new ConflictException('Role name already exists');
      }
      role.name = dto.name;
    }

    if (dto.permissionIds) {
      role.permissions = await this.loadPermissions(dto.permissionIds);
    }

    if (dto.access) {
      role.permissions = await this.usersService.resolveAccessPermissions(
        dto.access.map((grant) => ({
          section: grant.section,
          level: grant.level,
          namespace: grant.namespace ?? null,
        })),
      );
    }

    const saved = await this.usersService.saveRole(role);
    return sanitizeAdminRole(saved);
  }

  async deleteRole(id: string) {
    const role = await this.usersService.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'admin') {
      throw new BadRequestException('Cannot delete the admin role');
    }

    const assignedCount = await this.usersService.countUsersWithRole(id);
    if (assignedCount > 0) {
      throw new BadRequestException('Role is assigned to users');
    }

    await this.usersService.deleteRole(id);
    return { ok: true };
  }

  async assignRolePermission(roleId: string, permissionId: string) {
    const role = await this.usersService.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission = await this.usersService.findPermissionById(permissionId);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const exists = role.permissions.some((item) => item.id === permissionId);
    if (!exists) {
      role.permissions.push(permission);
    }

    const saved = await this.usersService.saveRole(role);
    return sanitizeAdminRole(saved);
  }

  private async loadPermissions(permissionIds: string[]) {
    const permissions = await this.usersService.findAllPermissions();
    return permissions.filter((permission) => permissionIds.includes(permission.id));
  }
}
