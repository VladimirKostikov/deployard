import { IsOptional, IsString } from 'class-validator';

export class PodFilePathQueryDto {
  @IsString()
  namespace!: string;

  @IsString()
  deployment!: string;

  @IsOptional()
  @IsString()
  cluster?: string;

  @IsOptional()
  @IsString()
  container?: string;

  @IsOptional()
  @IsString()
  path?: string;
}
