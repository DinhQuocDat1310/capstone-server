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
    private readonly campaignService: CampaignService,
    private readonly verifyCampaignService: VerifyCampaignService,
  ) {}

  @ApiOperation({ summary: 'Get list verified campaigns' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.BRAND)
  @Status(UserStatus.VERIFIED)
  @Get('/verifies')
  async getListVerifyCampaign(@Request() req: RequestUser) {
    return await this.campaignService.getListCampaignByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Get list history campaigns' })
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
}