import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminRolesService } from './admin-roles.service';
import { AdminUsersService } from './admin-users.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: AdminUsersService,
    private readonly rolesService: AdminRolesService,
    private readonly permissionsService: AdminPermissionsService,
  ) {}

  listUsers() {
    return this.usersService.listUsers();
  }

  createUser(dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  updateUser(id: string, dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  deleteUser(id: string) {
    return this.usersService.deleteUser(id);
  }

  assignRole(userId: string, roleId: string) {
    return this.usersService.assignRole(userId, roleId);
  }

  listRoles() {
    return this.rolesService.listRoles();
  }

  createRole(dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  updateRole(id: string, dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  deleteRole(id: string) {
    return this.rolesService.deleteRole(id);
  }

  listPermissions() {
    return this.permissionsService.listPermissions();
  }

  createPermission(dto: CreatePermissionDto) {
    return this.permissionsService.createPermission(dto);
  }

  updatePermission(id: string, dto: UpdatePermissionDto) {
    return this.permissionsService.updatePermission(id, dto);
  }

  deletePermission(id: string) {
    return this.permissionsService.deletePermission(id);
  }

  assignRolePermission(roleId: string, permissionId: string) {
    return this.rolesService.assignRolePermission(roleId, permissionId);
  }
}
