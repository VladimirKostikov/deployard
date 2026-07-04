import { ApiProperty } from '@nestjs/swagger';
import { ReadyResponse, ReadyStatus } from '@dpd/shared';

export class ReadyResponseDto implements ReadyResponse {
  @ApiProperty({ example: 'ready', enum: ['ready', 'not_ready'] })
  status!: ReadyStatus;

  @ApiProperty({ example: true })
  k8s!: boolean;

  @ApiProperty({ example: '2026-06-23T15:37:43.964Z' })
  timestamp!: string;
}
