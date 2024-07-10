import { PickType } from '@nestjs/swagger';
import { ShowPrice } from '../entities/show-price.entity';

export class CreatePriceDto extends PickType(ShowPrice, [
  'priceA',
  'priceS',
  'priceR',
  'priceVip',
]) {}
