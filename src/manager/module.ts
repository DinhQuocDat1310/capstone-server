import { Module } from '@nestjs/common';
import { ManagerController } from './controller';
import { ManagersService } from './service';

@Module({
  controllers: [ManagerController],
  providers: [ManagersService],
})
export class ManagerModule {}
