import { Global, Module } from '@nestjs/common';
import { ActiveStreamRegistry } from './active-stream.registry';

@Global()
@Module({
  providers: [ActiveStreamRegistry],
  exports: [ActiveStreamRegistry],
})
export class StreamsModule {}
