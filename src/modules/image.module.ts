import { Module } from '@nestjs/common';
import { ImageController } from 'src/contorllers/image.controller';
import { ImageService } from 'src/services/image.service';
import { FireaseModule } from './firebase.module';

@Module({
  imports: [FireaseModule],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
