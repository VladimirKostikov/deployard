import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { sanitizeAdminPermission } from './admin.mapper';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class AdminPermissionsService {
  constructor(private readonly usersService: UsersService) {}

  async listPermissions() {
    const permissions = await this.usersService.findAllPermissions();
    return permissions.map((permission) => sanitizeAdminPermission(permission));
  }

  async createPermission(dto: CreatePermissionDto) {
    const permission = new PermissionEntity();
    permission.section = dto.section;
    permission.level = dto.level;
    permission.namespace = dto.namespace ?? null;
    return this.usersService.savePermission(permission);
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    const permission = await this.usersService.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (dto.section) {
      permission.section = dto.section;
    }

    if (dto.level) {
      permission.level = dto.level;
    }

    if (dto.namespace !== undefined) {
      permission.namespace = dto.namespace || null;
    }

    return this.usersService.savePermission(permission);
  }

  async deletePermission(id: string) {
    const permission = await this.usersService.findPermissionById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const roles = await this.usersService.findAllRoles();
    for (const role of roles) {
      role.permissions = role.permissions.filter((item) => item.id !== id);
      await this.usersService.saveRole(role);
    }

    await this.usersService.deletePermission(id);
    return { ok: true };
  }
}
