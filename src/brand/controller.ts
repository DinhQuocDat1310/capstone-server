import {
  Body,
  Controller,
  HttpCode,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { BrandDTO } from './dto';
import { BrandsService } from './service';

@Controller('brand')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@Roles(Role.BRAND)
@ApiBearerAuth('access-token')
@ApiTags('Brand')
export class BrandController {
  constructor(private readonly brandService: BrandsService) {}
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullname: { type: 'string' },
        address: { type: 'string' },
        phoneNumber: { type: 'string' },
        typeBusiness: {
          type: 'enum',
          default: 'test',
          enum: ['test', 'data'],
        },
        logo: { type: 'string', format: 'binary' },
        imageCitizenFront: { type: 'string', format: 'binary' },
        imageCitizenBack: { type: 'string', format: 'binary' },
        imageLicenseBusiness: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo' },
      { name: 'imageLicenseBusiness' },
      { name: 'imageCitizenFront' },
      { name: 'imageCitizenBack' },
    ]),
  )
  @ApiOperation({ summary: 'Update data for brand' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({ description: 'ok' })
  @HttpCode(200)
  @Status(UserStatus.NEW)
  @Put('')
  async updateBrandInformation(
    @Request() req: RequestUser,
    @Body() dto: BrandDTO,
    @UploadedFiles()
    files: {
      logo: Express.Multer.File[];
      imageLicenseBusiness: Express.Multer.File[];
      imageCitizenBack: Express.Multer.File[];
      imageCitizenFront: Express.Multer.File[];
    },
  ) {
    return await this.brandService.updateBrandInformation(dto, req.user, {
      logo: files.logo[0],
      imageLicenseBusiness: files.imageLicenseBusiness[0],
      imageCitizenFront: files.imageCitizenFront[0],
      imageCitizenBack: files.imageCitizenBack[0],
    });
  }
}
