// import { CloudinaryService } from './service';
// import {
//   Controller,
//   Post,
//   UploadedFile,
//   UploadedFiles,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FilesInterceptor } from '@nestjs/platform-express';

// @Controller('cloudinary')
// export class CloudinaryController {
//   constructor(private readonly cloudinaryService: CloudinaryService) {}

//   @Post('/upload-image')
//   @UseInterceptors(FilesInterceptor('files', 4))
//   async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
//     return await this.cloudinaryService.uploadImages(files);
//   }
// }
