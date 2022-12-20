import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RequestUser } from 'src/auth/dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { VerifyCampaignService } from 'src/verifyCampaign/service';

@Controller('auto-assign')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Auto Assign System')
export class AutoAssignController {
  constructor(
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly verifyCampaignService: VerifyCampaignService,
  ) {}

  // @ApiOperation({ summary: 'Automation create request for brand/driver' })
  // @ApiForbiddenResponse({
  //   description: "Account don't have permission to use this feature",
  // })
  // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @Roles(Role.ADMIN)
  // @Get('fake/account/autoCreateNewRequest')
  // async addFakeData() {
  //   return this.verifyAccountService.fakeAutoCreateVerifyRequest();
  // }

  // @ApiOperation({ summary: 'Automation create request for campaign' })
  // @ApiForbiddenResponse({
  //   description: "Account don't have permission to use this feature",
  // })
  // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @Roles(Role.ADMIN)
  // @Get('fake/campaign/autoCreateNewRequest')
  // async addFakeDataCampaign() {
  //   return this.verifyCampaignService.fakeAutoCreateVerifyCampaignRequest();
  // }

  @ApiOperation({ summary: 'Automation ACCEPT verified Brand/Driver' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiNotFoundResponse({
    description: 'Not found any verify account request',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('fake/autoVerifiedAccountRequest/')
  async fakeVerifyDataAccount(@Request() req: RequestUser) {
    return this.verifyAccountService.fakeAutoVerifyAccountRequest(req.user.id);
  }

  /* 
  @Post('fake/campaign/auto-assign-full-request')
  async autoAssignDriverInCampaigns(
    @Request() req: RequestUser,
    @Param('id') campaignId: string,
  ) {
    await this.veri;
  }
  */
}
