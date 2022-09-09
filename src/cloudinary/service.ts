import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import {
  FileImageUploaddedForBrand,
  FileImageUploadForBrand,
} from 'src/brand/dto';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImages(
    files: FileImageUploadForBrand,
  ): Promise<FileImageUploaddedForBrand> {
    const result: FileImageUploaddedForBrand = {};
    for (const key in files) {
      const upload = await this.uploadImage(files[key]);
      result[key] = upload.url;
    }
    return result;
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}
