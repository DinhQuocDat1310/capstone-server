import { CloudinaryProvider } from './cloudinary';
import { Module } from '@nestjs/common';
import { CloudinaryService } from './service';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
