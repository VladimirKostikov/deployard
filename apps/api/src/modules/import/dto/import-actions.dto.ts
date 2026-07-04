import { IsArray, IsBoolean, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ComposeBuildDto {
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
  @IsString()
  namespace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partOf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  syncToCluster?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clusterContext?: string;
}

export class ClusterImageLoadDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  imageOverrides?: Record<string, string>;
}
