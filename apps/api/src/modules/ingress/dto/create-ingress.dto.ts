import { IsInt, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateIngressDto {
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
  host!: string;

  @IsString()
  @MinLength(1)
  path!: string;

  @IsString()
  @MinLength(1)
  serviceName!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  servicePort!: number;
}
