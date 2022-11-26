import { StatusGuard } from './../guard/userStatus.guard';
import { VerifyCampaignService } from './../verifyCampaign/service';
import {
  Controller,
  Post,
  Request,
  Body,
  Get,
  UseGuards,
  Param,
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
import { Roles, Status } from 'src/guard/decorators';
import { CampaignVerifyInformationDTO } from './dto';
import { CampaignService } from './service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';

@Controller('campaign')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiTags('Campaign')
export class CampaignController {
  constructor(
    private readonly verifyCampaignService: VerifyCampaignService,
    private readonly campaignService: CampaignService,
  ) {}

  @ApiOperation({
    summary: 'Get list verifies campaigns (For Tab: Verify Campaign)',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND)
  @Status(UserStatus.VERIFIED)
  @Get('/verifies/waiting')
  async getListVerifyCampaign(@Request() req: RequestUser) {
    return await this.campaignService.getListVerifiesCampaignByUserId(
      req.user.id,
    );
  }

  @ApiOperation({
    summary: 'Get list current campaigns (For Tab: Current Campaign)',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND)
  @Status(UserStatus.VERIFIED)
  @Get('/verifies/current')
  async getListCurrentCampaign(@Request() req: RequestUser) {
    return await this.campaignService.getListCurrentCampaignByUserId(
      req.user.id,
    );
  }

  @ApiOperation({
    summary: 'Get list history campaigns (For Tab: History Campaign)',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND)
  @Status(UserStatus.VERIFIED)
  @Get('/verifies/history')
  async getListVerifyHistoryCampaign(@Request() req: RequestUser) {
    return await this.campaignService.getListHistoryCampaignByUserId(
      req.user.id,
    );
  }

  @ApiOperation({
    summary: 'View campaign details by Campaign ID',
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND, Role.MANAGER)
  @Status(UserStatus.VERIFIED)
  @Get('/verifies/details/:id')
  async getDetailCampaign(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.viewCampaignDetails(
      req.user.id,
      campaignId,
    );
  }

  @ApiBody({ type: CampaignVerifyInformationDTO })
  @ApiOperation({ summary: 'Update campaign data verification' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Updated' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.BRAND)
  @Post('/verify/:id')
  async updateCampaignInformation(
    @Request() req: RequestUser,
    @Body() dto: CampaignVerifyInformationDTO,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.updateCampaign(dto, req.user, campaignId);
  }

  @ApiBody({ type: CampaignVerifyInformationDTO })
  @ApiOperation({ summary: 'Create campaign data verification' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Create' })
  @Roles(Role.BRAND)
  @Status(UserStatus.VERIFIED)
  @Post('/create')
  async createCampaignInformation(
    @Request() req: RequestUser,
    @Body() dto: CampaignVerifyInformationDTO,
  ) {
    return await this.campaignService.createCampaign(dto, req.user.id);
  }

  @ApiOperation({ summary: 'Cancel for New campaign' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Create' })
  @Roles(Role.BRAND)
  @Status(UserStatus.VERIFIED)
  @Post('/cancel/:id')
  async cancelNewCampaign(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.cancelCampaign(req.user.id, campaignId);
  }

  @ApiOperation({ summary: 'Get the current driver join campaign' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Create' })
  @Roles(Role.BRAND, Role.MANAGER)
  @Status(UserStatus.VERIFIED)
  @Get('/quantity-driver-join/:id')
  async getCurrentDriverJoinCampaign(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.getAmountDriverJoinCampaignBrand(
      req.user.id,
      campaignId,
    );
  }

  @ApiOperation({ summary: 'Get total daily kilometer report' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND, Role.MANAGER, Role.ADMIN)
  @Status(UserStatus.VERIFIED)
  @Get('/km-daily-report/:id')
  async getDailyReportKilometer(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.getKilometerDailyReport(
      req.user.id,
      req.user.role,
      campaignId,
    );
  }

  @ApiOperation({ summary: 'Get list driver running of campaign' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND, Role.MANAGER)
  @Status(UserStatus.VERIFIED)
  @Get('/list-driver-running/:id')
  async getListDriverRunning(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.getListDriverRunning(
      req.user.id,
      campaignId,
    );
  }

  @ApiOperation({ summary: 'Get total final kilometer report' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND, Role.MANAGER)
  @Status(UserStatus.VERIFIED)
  @Get('/total-km-final-report/:id')
  async getFinalReportKilometer(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.getKilometerFinalReport(
      req.user.id,
      campaignId,
    );
  }

  @ApiOperation({ summary: 'Trigger auto driver join campaign' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Status(UserStatus.VERIFIED)
  @Get('/trigger-driver-join/:id')
  async triggerDriversJoinCampaign(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    return await this.campaignService.triggerDriversJoinCampaign(campaignId);
  }
}
