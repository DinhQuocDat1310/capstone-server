import { Controller, UseGuards, Get, Param, Request } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { ReporterService } from './service';

@Controller('reporter')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Reporter')
export class ReporterController {
  constructor(private readonly reporterService: ReporterService) {}

  @ApiOperation({ summary: 'Get list Reporters' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/list')
  async getListManager() {
    return await this.reporterService.getListReporter();
  }

  @ApiOperation({ summary: 'View list campaign in Reporter Location' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/list/campaign/:id')
  async viewListCampaignReporterLocation(@Param('id') reporterId: string) {
    return await this.reporterService.getListCampaignInReporterLocation(
      reporterId,
    );
  }

  @ApiOperation({ summary: 'View list driver detail by CarID' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.REPORTER)
  @Get('/driver/car/:id')
  async viewDriverByCarId(
    @Param('id') carId: string,
    @Request() req: RequestUser,
  ) {
    return await this.reporterService.getDriverDetailByCarId(
      carId,
      req.user.id,
    );
  }
}
