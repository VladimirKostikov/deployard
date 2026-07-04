import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RollbackDeploymentDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  revision!: number;
}
