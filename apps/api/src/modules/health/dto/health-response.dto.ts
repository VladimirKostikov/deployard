import { ApiProperty } from '@nestjs/swagger';
import { HealthResponse, HealthStatus } from '@dpd/shared';

export class HealthResponseDto implements HealthResponse {
  @ApiProperty({ example: 'ok', enum: ['ok'] })
  status!: HealthStatus;

  @ApiProperty({ example: '2026-06-23T15:37:43.964Z' })
  timestamp!: string;
}
