import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { rejects } from 'assert';
import { resolve } from 'path';
import { ImageResponse } from 'src/dtos/Response/ImageResponse.dto';
import { FirebaseService } from './firebase.service';

@Injectable()
export class ImageService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async uploadImage(file: Express.Multer.File): Promise<ImageResponse> {
    if (!file) {
      throw new BadRequestException(
        'Sever get empty file', // status 400
      );
    }
    const acceptedFileTypes = ['image/jpeg', 'image/png'];
    // Check if the file type is in the accepted types array
    if (!acceptedFileTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'File type not supported. Only JPEG and PNG files are allowed.', // status 400
      );
    }
    const storage = this.firebaseService.getStorgeInstance();
    const bucket = storage.bucket();
    const fileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });
      stream.on('finish', () => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileName}?alt=media`;
        const imageResponse: ImageResponse = {
          imageUrl: imageUrl,
        };
        resolve(imageResponse);
      });
      stream.end(file.buffer);
    });
  }
}
