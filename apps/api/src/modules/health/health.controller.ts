import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/auth.decorators';
import { HealthResponseDto } from './dto/health-response.dto';
import { ReadyResponseDto } from './dto/ready-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
@Public()
@SkipThrottle()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthResponseDto })
  getHealth(): HealthResponseDto {
    return this.healthService.getHealth();
  }

  @Get('ready')
  @ApiOkResponse({ type: ReadyResponseDto })
  getReady(): ReadyResponseDto {
    return this.healthService.getReady();
  }
}
