import { Module } from '@nestjs/common';
import { ConfigJsonService } from './service';
import { ConfigJsonController } from './controller';

@Module({
  controllers: [ConfigJsonController],
  providers: [ConfigJsonService],
})
export class ConfigJsonModule {}
