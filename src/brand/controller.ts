import {
  Body,
  Controller,
  HttpCode,
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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Account is invalid. Contact admin',
  })
  @ApiConflictResponse({
    status: HttpStatus.CONFLICT,
    description: 'Account already add verify data',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Id license or No card number invalid',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Phonenumber already used',
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not found account email',
  })
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Created success',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
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
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not found account email',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Id license or No card number invalid',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Phonenumber already used',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Update data verify success',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
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
}
