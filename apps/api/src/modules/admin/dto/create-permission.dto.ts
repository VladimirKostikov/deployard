import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccessLevel, AppSection } from '@dpd/shared';

export class CreatePermissionDto {
  @IsEnum(AppSection)
  section!: AppSection;

  @IsEnum(AccessLevel)
  level!: AccessLevel;

  @IsOptional()
  @IsString()
  namespace?: string;
}

export class AssignRolePermissionDto {
  @IsString()
  permissionId!: string;
}
