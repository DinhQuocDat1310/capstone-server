import { CloudinaryProvider } from './cloudinary';
import { Module } from '@nestjs/common';
import { CloudinaryService } from './service';
import { CloudinaryController } from './controller';

@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}
