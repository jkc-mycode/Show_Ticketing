import { PickType } from '@nestjs/swagger';
import { ShowImage } from '../entities/show-image.entity';

export class UploadImageDto extends PickType(ShowImage, ['imageUrl']) {}
