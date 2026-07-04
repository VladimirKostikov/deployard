import { IsBoolean, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectImportDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  namespace!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  projectId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  imageOverrides?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exposeHostPorts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  skipImagePrepare?: boolean;
}
