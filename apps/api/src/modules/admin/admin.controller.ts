import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessLevel, AppSection } from '@dpd/shared';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { AdminService } from './admin.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignRolePermissionDto } from './dto/create-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('admin')
@Controller('admin')
@RequireAccess(AppSection.ADMIN, AccessLevel.MANAGE)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/:id/roles')
  assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return this.adminService.assignRole(id, dto.roleId);
  }

  @Get('roles')
  listRoles() {
    return this.adminService.listRoles();
  }

  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) {
    return this.adminService.createRole(dto);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.adminService.deleteRole(id);
  }

  @Get('permissions')
  listPermissions() {
    return this.adminService.listPermissions();
  }

  @Post('permissions')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.adminService.createPermission(dto);
  }

  @Patch('permissions/:id')
  updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.adminService.updatePermission(id, dto);
  }

  @Delete('permissions/:id')
  deletePermission(@Param('id') id: string) {
    return this.adminService.deletePermission(id);
  }

  @Post('roles/:id/permissions')
  assignRolePermission(@Param('id') id: string, @Body() dto: AssignRolePermissionDto) {
    return this.adminService.assignRolePermission(id, dto.permissionId);
  }
}
