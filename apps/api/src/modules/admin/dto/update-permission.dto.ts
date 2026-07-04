import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccessLevel, AppSection } from '@dpd/shared';

export class UpdatePermissionDto {
  @IsOptional()
  @IsEnum(AppSection)
  section?: AppSection;

  @IsOptional()
  @IsEnum(AccessLevel)
  level?: AccessLevel;

  @IsOptional()
  @IsString()
  namespace?: string;
}
