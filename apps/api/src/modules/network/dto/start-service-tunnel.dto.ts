import { IsInt, IsString, Max, Min } from 'class-validator';

export class StartServiceTunnelDto {
  @IsString()
  namespace!: string;

  @IsString()
  serviceName!: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  servicePort!: number;
}
