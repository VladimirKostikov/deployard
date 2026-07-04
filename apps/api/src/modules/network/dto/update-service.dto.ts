import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type { ServiceType } from '@dpd/shared';

class ServicePortDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsInt()
  @Min(1)
  @Max(65535)
  targetPort!: number;

  @IsOptional()
  @IsInt()
  @Min(30000)
  @Max(32767)
  nodePort?: number;

  @IsOptional()
  @IsString()
  protocol?: string;
}

export class UpdateServiceDto {
  @IsString()
  namespace!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsIn(['ClusterIP', 'NodePort', 'LoadBalancer'])
  type?: ServiceType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicePortDto)
  ports?: ServicePortDto[];
}
