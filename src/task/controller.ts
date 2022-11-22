import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TasksService } from './service';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/guard/decorators';
import { Role } from '@prisma/client';
import { LocationCoordinateDTO } from 'src/location/dto';
import { LocationService } from 'src/location/service';

@Controller('manual')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Cron-job manually')
export class TaskController {
  constructor(
    private readonly taskService: TasksService,
    private readonly locationService: LocationService,
  ) {}

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

  @ApiBody({ type: LocationCoordinateDTO })
  @ApiOperation({ summary: 'Haversine distance formular' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Post('/calculate/long-lat')
  async CalCulateLongLatDistance(
    @Request() req: RequestUser,
    @Body() dto: LocationCoordinateDTO,
  ) {
    return await this.locationService.CalculateLatLongToMetersDistance(
      dto.pointA,
      dto.pointB,
    );
  }
}
