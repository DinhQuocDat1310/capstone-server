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
import { Role, StatusUser } from '@prisma/client';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
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
  ) {}

  @ApiBody({ type: DriverVerifyInformationDTO })
  @ApiOperation({ summary: 'Update data Driver verification' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Updated' })
  @Status(StatusUser.NEW, StatusUser.UPDATE)
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
  @Status(StatusUser.UPDATE)
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
  @Status(StatusUser.VERIFIED)
  @Post('join-campaign')
  async joinVerifyCampaigns(
    @Request() req: RequestUser,
    @Body() campaign: { id: string },
  ) {
    return await this.driverService.driverJoinCampaign(campaign.id, req.user);
  }

  @ApiOperation({ summary: 'Get the list campaign in location driver' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Create' })
  @Roles(Role.DRIVER)
  @Status(StatusUser.VERIFIED)
  @Get('/list-campaigns')
  async getListCampaignForDriver(@Request() req: RequestUser) {
    return await this.driverService.getListCampaigns(
      req.user.id,
      req.user.address,
    );
  }

  @ApiOperation({ summary: 'Get list campaign joining and joined' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Get('/joining-joined')
  @Roles(Role.DRIVER)
  async getListJoiningJoinedCampaign(@Request() req: RequestUser) {
    return await this.driverService.getCampaignJoiningAndJoined(req.user.id);
  }

  @ApiOperation({ summary: 'Get daily scan QR code' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Get('/checkpoint/:id')
  @Roles(Role.DRIVER)
  async getDailyScanQRcode(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.driverService.getDailyScanQRCode(req.user.id, campaignId);
  }

  @ApiOperation({
    summary: 'Get total meter by date with driverJoineCampaign ID',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Get('/location/totalMeterByDate/:id')
  @Roles(Role.DRIVER)
  async getTotalKmByCurrentDate(@Param('id') driverJoinCampaignId: string) {
    return await this.driverService.getTotalKmByCurrentDate(
      driverJoinCampaignId,
    );
  }

  @ApiOperation({ summary: 'Get history campaign driver joined and finished' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Get('history/campaign')
  @Roles(Role.DRIVER)
  async historyDriverFinished(@Request() req: RequestUser) {
    return await this.driverService.getHistoryCampaignFinished(req.user.id);
  }
}
