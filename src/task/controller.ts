import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TasksService } from './service';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/decorators';
import { Role } from '@prisma/client';

@Controller('manual')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Cron-job manually')
export class TaskController {
  constructor(private readonly taskService: TasksService) {}

  @ApiOperation({ summary: 'Add manager to verify account manually' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Get('/add-manager/verify-account')
  async addManagerToVerifyAccount() {
    return await this.taskService.handleAddManagerVerifyAccountData();
  }

  @ApiOperation({ summary: 'Add manager to verify campaign data manually' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Get('/add-manager/verify-campaign')
  async addManagerToVerifyCampaign() {
    return await this.taskService.handleAddManagerVerifyCampaignData();
  }

  @ApiOperation({ summary: 'Complete register campaign phase manually' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Get('/complete/register-phase')
  async CompleteRegisterCampaignPhase() {
    return await this.taskService.handleCompleteRegisterCampaignPhase();
  }

  @ApiOperation({ summary: 'Complete Wrapping campaign phase manually' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Get('/complete/wrap-phase')
  async CompleteWrapCampaignPhase() {
    return await this.taskService.handleCompleteWrappingCampaignPhase();
  }

  @ApiOperation({ summary: 'Complete Running campaign phase manually' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Get('/complete/run-phase')
  async CompleteRunningCampaignPhase() {
    return await this.taskService.handleCompleteRunningCampaignPhase();
  }
}
