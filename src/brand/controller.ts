import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/auth.guard';
import { VerifyDataDto } from './dto';
import { BrandsService } from './service';
@Controller('brand')
@ApiTags('Brand')
export class BrandController {
  constructor(private readonly brandService: BrandsService) {}

  @Post('/verify-information/:email')
  @ApiBody({ type: VerifyDataDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo' },
      { name: 'imageLicense' },
      { name: 'imageFront' },
      { name: 'imageBack' },
    ]),
  )
  @ApiOperation({ summary: 'Add verify data for brand' })
  @UseGuards(JwtAuthGuard)
  async addInformation(
    @Body() brand: VerifyDataDto,
    @Param('email') email: string,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      imageLicense?: Express.Multer.File[];
      imageBack?: Express.Multer.File[];
      imageFront?: Express.Multer.File[];
    },
  ) {
    console.log(files);
    return await this.brandService.addDataVerify(brand, email, [
      ...files.logo,
      ...files.imageLicense,
      ...files.imageFront,
      ...files.imageBack,
    ]);
  }

  @Get('/viewListVerify/:email')
  @ApiOperation({ summary: 'View list verifying by manager email' })
  @UseGuards(JwtAuthGuard)
  async listVerifyBrand(@Param('email') email: string) {
    return await this.brandService.viewListVerifyByManager(email);
  }
}
