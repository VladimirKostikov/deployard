import { IsBoolean, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ComposeImportDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  namespace!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  composeYaml!: string;

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
  @IsString()
  projectName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  skipImagePrepare?: boolean;
}

export class DockerProjectImportDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  namespace!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  projectName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  imageOverrides?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  exposeHostPorts?: boolean;
}
