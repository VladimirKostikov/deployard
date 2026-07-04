import { Global, Module } from '@nestjs/common';
import { SecurityBootstrapService } from './security-bootstrap.service';

@Global()
@Module({
  providers: [SecurityBootstrapService],
  exports: [SecurityBootstrapService],
})
export class SecurityModule {}
