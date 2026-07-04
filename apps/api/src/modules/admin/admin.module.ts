import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminRolesService } from './admin-roles.service';
import { AdminService } from './admin.service';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [UsersModule],
  controllers: [AdminController],
  providers: [AdminService, AdminUsersService, AdminRolesService, AdminPermissionsService],
})
export class AdminModule {}
