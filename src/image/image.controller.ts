import { Controller, Get, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from './image.service';

@Controller('countries/image')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Get()
  getImage(@Res() res: Response) {
    const path = this.imageService.getImagePath();
    if (!path) {
      throw new NotFoundException({ error: 'Summary image not found' });
    }
    res.sendFile(path);
  }
}
