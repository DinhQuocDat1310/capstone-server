import { WrapService } from 'src/wrap/service';
import { LocationService } from './../location/service';
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
import { BrandVerifyInformationDTO, UpdateBrandLogoDto } from './dto';
import { BrandsService } from './service';

@Controller('brand')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Brand')
export class BrandController {
  constructor(
    private readonly brandService: BrandsService,
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly locationService: LocationService,
    private readonly wrapService: WrapService,
  ) {}

  @ApiBody({ type: BrandVerifyInformationDTO })
  @ApiOperation({ summary: 'Update data brand verification' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Updated' })
  @Status(UserStatus.NEW, UserStatus.UPDATE)
  @Roles(Role.BRAND)
  @Post('account/verify')
  async updateBrandInformation(
    @Request() req: RequestUser,
    @Body() dto: BrandVerifyInformationDTO,
  ) {
    return await this.brandService.updateBrandVerify(dto, req.user);
  }

  @ApiBody({ type: UpdateBrandLogoDto })
  @ApiOperation({ summary: 'Update logo brand verification' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Updated' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.BRAND)
  @Post('account/update-logo/')
  async updateBrandLogo(
    @Request() req: RequestUser,
    @Body() dto: UpdateBrandLogoDto,
  ) {
    return await this.brandService.updateBrandLogo(dto, req.user);
  }

  @ApiOperation({ summary: 'Get history verified account' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND)
  @Status(UserStatus.UPDATE)
  @Get('account/verify')
  async getListVerifyBrand(@Request() req: RequestUser) {
    return await this.verifyAccountService.getListVerifyByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Get list locations' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND)
  @Status(UserStatus.NEW, UserStatus.UPDATE, UserStatus.VERIFIED)
  @Get('/locations')
  async getListLocations(@Request() req: RequestUser) {
    return await this.locationService.getListLocation(req.user.role);
  }

  @ApiOperation({ summary: 'Get list wraps' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.BRAND)
  @Get('/wraps')
  async getListWrap(@Request() userReq: RequestUser) {
    return await this.wrapService.getListWrap(userReq.user.role);
  }
}
