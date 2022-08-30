import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImages(files: Express.Multer.File[]) {
    return Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const upload = v2.uploader.upload_stream((error, result) => {
            if (error) return reject(error);
            return resolve(result);
          });
          streamifier.createReadStream(file.buffer).pipe(upload);
        });
      }),
    );
  }
}
