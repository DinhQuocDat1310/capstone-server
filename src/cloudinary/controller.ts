import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Status } from 'src/guard/decorators';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { CloudinaryService } from './service';

@Controller('file')
@UseGuards(JwtAuthGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('File')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload file' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({
    description:
      'url: http://res.cloudinary.com/exampleId/image/upload/vExample/exampleId.type',
  })
  @Status(UserStatus.NEW, UserStatus.VERIFIED)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async updateBrandInformation(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Please provide image file');
    const image = await this.cloudinaryService.uploadImage(file);
    return image.url;
  }
}
