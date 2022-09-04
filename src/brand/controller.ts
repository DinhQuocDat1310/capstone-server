import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/auth.guard';
import { VerifyDataDto, UpdateVerifyDataDto } from './dto';
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
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Add verify data success',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Id license or No card number invalid',
  })
  @ApiConflictResponse({
    status: HttpStatus.CONFLICT,
    description: 'This user already have Id license or No card number',
  })
  // @UseGuards(JwtAuthGuard)
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
    return await this.brandService.addDataVerify(brand, email, [
      ...files.logo,
      ...files.imageLicense,
      ...files.imageFront,
      ...files.imageBack,
    ]);
  }

  @Post('/update-information/:email')
  @ApiBody({ type: UpdateVerifyDataDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo' },
      { name: 'imageLicense' },
      { name: 'imageFront' },
      { name: 'imageBack' },
    ]),
  )
  @ApiOperation({ summary: 'Update verify data for brand' })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Add verify data success',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Id license or No card number invalid',
  })
  @ApiConflictResponse({
    status: HttpStatus.CONFLICT,
    description: 'This user already have Id license or No card number',
  })
  // @UseGuards(JwtAuthGuard)
  async updateInformation(
    @Body() brand: UpdateVerifyDataDto,
    @Param('email') email: string,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      imageLicense?: Express.Multer.File[];
      imageBack?: Express.Multer.File[];
      imageFront?: Express.Multer.File[];
    },
  ) {
    if (
      !files.logo &&
      !files.imageLicense &&
      !files.imageFront &&
      !files.imageBack
    ) {
      return await this.brandService.updateVerifyData(brand, email, []);
    }
    const arr = [];
    files.logo ? arr.push(...files.logo) : undefined;
    files.imageLicense ? arr.push(...files.imageLicense) : undefined;
    files.imageFront ? arr.push(...files.imageFront) : undefined;
    files.imageBack ? arr.push(...files.imageBack) : undefined;
    return await this.brandService.updateVerifyData(brand, email, arr);
  }

  @Get('/viewListVerify/:email')
  @ApiOperation({ summary: 'View list verifying by manager email' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'View list brand verify success',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'View list brand verify fail',
  })
  async listVerifyBrand(@Param('email') email: string) {
    return await this.brandService.viewListVerifyByManager(email);
  }
}
