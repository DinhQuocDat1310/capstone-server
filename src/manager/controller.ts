import { VerifyCampaignService } from './../verifyCampaign/service';
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
import { ManagerVerifyDTO, ManagerVerifyCampaignDTO } from './dto';
import { ManagerService } from './service';

@Controller('manager')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Manager')
export class ManagerController {
  constructor(
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly managerService: ManagerService,
    private readonly verifyCampaignService: VerifyCampaignService,
  ) {}

  @ApiOperation({ summary: 'Verify account by Manager' })
  @ApiBody({ type: ManagerVerifyDTO })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('account/verify')
  @Roles(Role.MANAGER)
  async verifyAccount(
    @Request() req: RequestUser,
    @Body() dto: ManagerVerifyDTO,
  ) {
    return await this.verifyAccountService.managerVerifyAccount(
      req.user.id,
      dto,
    );
  }

  @ApiOperation({ summary: 'Get list verifies pending by role' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Role is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('account/verifies/:role')
  async getListVerifyByRole(
    @Request() req: RequestUser,
    @Param('role') role: string,
  ) {
    return await this.verifyAccountService.getListVerifyPendingByManagerId(
      req.user.id,
      role.toLowerCase(),
    );
  }

  @ApiOperation({ summary: 'Get list history verified by role' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Role is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('account/verifieds/:role')
  async getListVerifiedByRole(
    @Request() req: RequestUser,
    @Param('role') role: string,
  ) {
    return await this.verifyAccountService.getListHistoryVerifiedByManagerId(
      req.user.id,
      role.toLowerCase(),
    );
  }

  @ApiOperation({
    summary: 'Get history detail verified with BrandId/DriverId',
  })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Role is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('account/verified/:id')
  async getHistoryDetailVerified(
    @Request() req: RequestUser,
    @Param('id') id: string,
  ) {
    return await this.verifyAccountService.getHistoryDetailVerified(
      req.user.id,
      id,
    );
  }

  @ApiOperation({ summary: 'Get list verifies campaign pending' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('campaign/verifies/waiting')
  async getListVerifyCampaign(@Request() req: RequestUser) {
    return await this.verifyCampaignService.getListVerifyCampaignPending(
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Verify campaign by Manager' })
  @ApiBody({ type: ManagerVerifyCampaignDTO })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('campaign/verify')
  @Roles(Role.MANAGER)
  async verifyCampaign(
    @Request() req: RequestUser,
    @Body() dto: ManagerVerifyCampaignDTO,
  ) {
    return await this.verifyCampaignService.managerVerifyCampaign(
      req.user.id,
      dto,
    );
  }

  @ApiOperation({ summary: 'Get list history verified Campaign of Brand' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Role is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('campaign/verifieds/history')
  async getListVerifiedCampaign(@Request() req: RequestUser) {
    return await this.verifyCampaignService.getListHistoryVerifiedCampaignByManagerId(
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Get list current verified Campaign by Manager' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Role is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('campaign/verifieds/current')
  async getListCurrentVerifiedCampaign(@Request() req: RequestUser) {
    return await this.verifyCampaignService.getListCurrentCampaignByManagerId(
      req.user.id,
    );
  }

  @ApiOperation({
    summary: 'Get history detail verified Campaign',
  })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Role is not valid' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.MANAGER)
  @Get('campaign/verified/:id')
  async getHistoryDetailVerifiedCampaignDetail(
    @Request() req: RequestUser,
    @Param('id') id: string,
  ) {
    return await this.verifyCampaignService.getHistoryDetailVerifiedCampaign(
      req.user.id,
      id,
    );
  }
}
