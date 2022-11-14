import { Controller, UseGuards, Get, Request } from '@nestjs/common';
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
  @Roles(Role.REPORTER)
  @Get('/list/campaign')
  async viewListCampaignReporterLocation(@Request() req: RequestUser) {
    return await this.reporterService.getListCampaignInReporterLocation(
      req.user.id,
    );
  }
}
