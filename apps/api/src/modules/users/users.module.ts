import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity, RoleEntity, UserEntity } from './entities/user.entity';
import { DatabaseSeedService } from './seed/database-seed.service';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity])],
  providers: [UsersService, DatabaseSeedService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
