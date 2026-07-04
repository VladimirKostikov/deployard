import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateServiceDto {
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
  @MaxLength(63)
  @Matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/)
  deploymentName!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  targetPort?: number;
}
