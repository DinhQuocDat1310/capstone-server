import {
  Body,
  Controller,
  Get,
  Param,
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
import {
  DriverJoinCampaign,
  DriverTrackingLocation,
  DriverVerifyInformationDTO,
} from './dto';
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
  async updateDriverInformation(
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
  async getListVerifyDriver(@Request() req: RequestUser) {
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

  @ApiOperation({ summary: 'Get the list campaign in location driver' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Create' })
  @Roles(Role.DRIVER)
  @Status(UserStatus.VERIFIED)
  @Get('/list-campaigns')
  async getListCampaignForDriver(@Request() req: RequestUser) {
    return await this.driverService.getListCampaigns(
      req.user.id,
      req.user.address,
    );
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

  @ApiOperation({ summary: 'Get list campaign joining and joined' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Get('/joining-joined')
  @Roles(Role.DRIVER)
  async getListJoiningJoinedCampaign(@Request() req: RequestUser) {
    return await this.driverService.getCampaignJoiningAndJoined(req.user.id);
  }

  @ApiOperation({ summary: 'Save current location by date' })
  @ApiBody({ type: DriverTrackingLocation })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Post('/location/tracking')
  @Roles(Role.DRIVER)
  async saveCurrentLocationDriverByDate(@Body() dto: DriverTrackingLocation) {
    return await this.driverService.saveCurrentLocationDriverByDate(dto);
  }

  @ApiOperation({
    summary: 'Get total meter by date with driverJoineCampaign ID',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Get('/location/totalMeterByDate/:id')
  @Roles(Role.DRIVER)
  async getTotalKmByCurrentDate(@Param('id') driverJoinCampaignId: string) {
    return await this.driverService.getTotalKmByCurrentDate(
      driverJoinCampaignId,
    );
  }
}
