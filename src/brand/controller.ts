import { FilesInterceptor } from '@nestjs/platform-express';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VerifyDataDto } from './dto';
import { BrandsService } from './service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/auth.guard';
@Controller('brand')
@ApiTags('Brand')
export class BrandController {
  constructor(private readonly brandService: BrandsService) {}

  @Post('/verify-information/:email')
  @ApiBody({ type: VerifyDataDto })
  @UseInterceptors(FilesInterceptor('files', 4))
  @ApiOperation({ summary: 'Add verify data for brand' })
  @UseGuards(JwtAuthGuard)
  async addInformation(
    @Body() brand: VerifyDataDto,
    @Param('email') email: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.brandService.addDataVerify(brand, email, files);
  }

  @Get('/viewListVerify/:email')
  @ApiOperation({ summary: 'View list verifying by manager email' })
  @UseGuards(JwtAuthGuard)
  async listVerifyBrand(@Param('email') email: string) {
    return await this.brandService.viewListVerifyByManager(email);
  }
}
