import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NamespaceSummary, AccessLevel, AppSection } from '@dpd/shared';
import { RequireAccess } from '../auth/decorators/auth.decorators';
import { CreateNamespaceDto } from './dto/create-namespace.dto';
import { NamespacesService } from './namespaces.service';

@ApiTags('namespaces')
@Controller('namespaces')
export class NamespacesController {
  constructor(private readonly namespacesService: NamespacesService) {}

  @Get()
  @RequireAccess(AppSection.NAMESPACES, AccessLevel.VIEW)
  list(): Promise<NamespaceSummary[]> {
    return this.namespacesService.list();
  }

  @Post()
  @RequireAccess(AppSection.NAMESPACES, AccessLevel.MANAGE)
  create(@Body() dto: CreateNamespaceDto): Promise<NamespaceSummary> {
    return this.namespacesService.create(dto.name);
  }

  @Delete(':name')
  @RequireAccess(AppSection.NAMESPACES, AccessLevel.MANAGE)
  delete(@Param('name') name: string): Promise<{ ok: true }> {
    return this.namespacesService.delete(name).then(() => ({ ok: true as const }));
  }
}
