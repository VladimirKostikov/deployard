import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AccessLevel, AppSection } from '@dpd/shared';

export class SectionAccessDto {
  @IsEnum(AppSection)
  section!: AppSection;

  @IsEnum(AccessLevel)
  level!: AccessLevel;

  @IsOptional()
  @IsString()
  namespace?: string;
}

export class SectionAccessListDto {
  @ValidateNested({ each: true })
  @Type(() => SectionAccessDto)
  access!: SectionAccessDto[];
}
