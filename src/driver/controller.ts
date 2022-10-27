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
import { LocationService } from 'src/location/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { DriverJoinCampaign, DriverVerifyInformationDTO } from './dto';
import { DriversService } from './service';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Driver')
export class DriverController {
  constructor(
    private readonly driverService: DriversService,
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly locationService: LocationService,
  ) {}

  @ApiBody({ type: DriverVerifyInformationDTO })
  @ApiOperation({ summary: 'Update data Driver verification' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Updated' })
  @Status(UserStatus.NEW, UserStatus.UPDATE)
  @Roles(Role.DRIVER)
  @Post('account/verify')
  async updateBrandInformation(
    @Request() req: RequestUser,
    @Body() dto: DriverVerifyInformationDTO,
  ) {
    return await this.driverService.updateDriverVerify(dto, req.user);
  }

  @ApiOperation({ summary: 'Get history verified account' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.DRIVER)
  @Status(UserStatus.UPDATE)
  @Get('account/verify')
  async getListVerifyBrand(@Request() req: RequestUser) {
    return await this.verifyAccountService.getListVerifyByUserId(req.user.id);
  }

  @ApiBody({
    type: DriverJoinCampaign,
  })
  @ApiOperation({ summary: 'Driver join campaign' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.DRIVER)
  @Status(UserStatus.VERIFIED)
  @Post('join-campaign')
  async joinVerifyCampaigns(
    @Request() req: RequestUser,
    @Body() campaign: { id: string },
  ) {
    return await this.driverService.driverJoinCampaigin(campaign.id, req.user);
  }

  @ApiOperation({ summary: 'Get the current driver join campaign' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Create' })
  @Roles(Role.DRIVER)
  @Status(UserStatus.VERIFIED)
  @Get('/list-campaigns')
  async getListCampaignForDriver(@Request() req: RequestUser) {
    return await this.driverService.getListCampaigns(req.user.address);
  }

  @ApiOperation({ summary: 'get location' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Create' })
  @Roles(Role.DRIVER)
  @Status(UserStatus.NEW, UserStatus.UPDATE, UserStatus.VERIFIED)
  @Get('/locations')
  async getListLocations(@Request() req: RequestUser) {
    return await this.locationService.getListLocation(req.user.role);
  }
}
