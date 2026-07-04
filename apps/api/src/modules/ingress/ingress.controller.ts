import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IngressSummary, AccessLevel, AppSection } from '@dpd/shared';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { CreateIngressDto } from './dto/create-ingress.dto';
import { IngressService } from './ingress.service';

@ApiTags('ingress')
@Controller('ingress')
export class IngressController {
  constructor(private readonly ingressService: IngressService) {}

  @Get()
  @RequireAccess(AppSection.NETWORK, AccessLevel.VIEW)
  list(@Query('namespace') namespace: string): Promise<IngressSummary[]> {
    return this.ingressService.list(namespace);
  }

  @Post()
  @RequireAccess(AppSection.NETWORK, AccessLevel.MANAGE)
  create(@Body() dto: CreateIngressDto): Promise<IngressSummary> {
    return this.ingressService.create(dto);
  }

  @Delete(':name')
  @RequireAccess(AppSection.NETWORK, AccessLevel.MANAGE)
  delete(@Query('namespace') namespace: string, @Param('name') name: string): Promise<{ ok: true }> {
    return this.ingressService.delete(namespace, name).then(() => ({ ok: true as const }));
  }
}
