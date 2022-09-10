import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { BrandVerifyInformationDTO } from './dto';
import { BrandsService } from './service';

@Controller('brand')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Brand')
export class BrandController {
  constructor(
    private readonly brandService: BrandsService,
    private readonly verifyAccountService: VerifyAccountsService,
  ) {}

  @ApiBody({ type: BrandVerifyInformationDTO })
  @ApiOperation({ summary: 'Update data brand verification' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse()
  @Status(UserStatus.NEW, UserStatus.PENDING)
  @Roles(Role.BRAND)
  @Post('verify')
  async updateBrandInformation(
    @Request() req: RequestUser,
    @Body() dto: BrandVerifyInformationDTO,
  ) {
    return await this.brandService.updateBrandVerify(dto, req.user);
  }

  @ApiOperation({ summary: 'Get list verify brand' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.PENDING)
  @Get('verify')
  async getListVerifyBrand(@Request() req: RequestUser) {
    return await this.verifyAccountService.getListVerifyBrandByUserId(
      req.user.id,
    );
  }
}
