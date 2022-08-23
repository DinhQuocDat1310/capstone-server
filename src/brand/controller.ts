import { Controller } from '@nestjs/common';
import { BrandsService } from './service';

@Controller('test')
export class BrandController {
  constructor(private readonly brandService: BrandsService) {}
}
