import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export class EnvVarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name!: string;

  @IsString()
  @MaxLength(4096)
  value!: string;
}

export class CreateDeploymentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(63)
  @Matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)
  name!: string;

  @IsString()
  @MinLength(1)
  namespace!: string;

  @IsString()
  @MinLength(1)
  image!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  replicas!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  containerPort?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnvVarDto)
  env?: EnvVarDto[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(63)
  @Matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)
  partOf?: string;
}

export class UpdateDeploymentImageDto {
  @IsString()
  @MinLength(1)
  image!: string;
}

export class UpdateDeploymentConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnvVarDto)
  env!: EnvVarDto[];
}
