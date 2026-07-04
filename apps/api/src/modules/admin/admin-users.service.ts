import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { sanitizeAdminUser } from './admin.mapper';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly usersService: UsersService) {}

  async listUsers() {
    const users = await this.usersService.findAll();
    return users.map((user) => sanitizeAdminUser(user));
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const user = new UserEntity();
    user.email = dto.email.toLowerCase();
    user.displayName = dto.displayName;
    user.passwordHash = await bcrypt.hash(dto.password, 12);
    user.isActive = true;
    user.roles = await this.loadRoles(dto.roleIds);

    const saved = await this.usersService.saveUser(user);
    return sanitizeAdminUser(saved);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.displayName) {
      user.displayName = dto.displayName;
    }

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    if (dto.roleIds) {
      user.roles = await this.loadRoles(dto.roleIds);
    }

    const saved = await this.usersService.saveUser(user);
    return sanitizeAdminUser(saved);
  }

  async deleteUser(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.roles.some((role) => role.name === 'admin')) {
      const admins = (await this.usersService.findAll()).filter((item) =>
        item.roles.some((role) => role.name === 'admin'),
      );
      if (admins.length <= 1) {
        throw new BadRequestException('Cannot delete the last admin user');
      }
    }

    await this.usersService.deleteUser(id);
    return { ok: true };
  }

  async assignRole(userId: string, roleId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.usersService.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const exists = user.roles.some((item) => item.id === roleId);
    if (!exists) {
      user.roles.push(role);
    }

    const saved = await this.usersService.saveUser(user);
    return sanitizeAdminUser(saved);
  }

  private async loadRoles(roleIds: string[]) {
    const roles = await this.usersService.findAllRoles();
    return roles.filter((role) => roleIds.includes(role.id));
  }
}
