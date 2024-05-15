import { Controller, Get, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Post } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ImageService } from 'src/services/image.service';

@Controller('api/image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.imageService.uploadImage(file);
  }
}
