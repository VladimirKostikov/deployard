import { DeployWebhookAction } from '@dpd/shared';
import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class DeployWebhookDto {
  @IsOptional()
  @IsIn(['update_image', 'create'] satisfies DeployWebhookAction[])
  action?: DeployWebhookAction;

  @IsString()
  @MinLength(1)
  namespace!: string;

  @IsString()
  @MinLength(1)
  deployment!: string;

  @IsString()
  @MinLength(1)
  image!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  replicas?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  containerPort?: number;

  @IsOptional()
  @IsString()
  cluster?: string;
}
