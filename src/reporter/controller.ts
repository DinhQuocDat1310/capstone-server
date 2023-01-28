import { CreateReportDriverCampaignDTO } from './dto';
import {
  Controller,
  UseGuards,
  Get,
  Param,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/list')
  async getListReporter() {
    return await this.reporterService.getListReporter();
  }

  @ApiOperation({ summary: 'Get list Reporters Available' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/list-available')
  async getListReporterAvailable() {
    return await this.reporterService.getListReporterAvailable();
  }

  @ApiOperation({ summary: 'View list campaign in Reporter Location' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
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
  @Status(StatusUser.VERIFIED)
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

  @ApiOperation({ summary: 'Submit result check Driver running' })
  @ApiBody({ type: CreateReportDriverCampaignDTO })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.REPORTER)
  @Post('/check/driver')
  async submitCheckDriverRun(
    @Body() dto: CreateReportDriverCampaignDTO,
    @Request() req: RequestUser,
  ) {
    return await this.reporterService.createReporterDriverCampaign(
      dto,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Scan QR Driver' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.REPORTER)
  @Get('/scan-driver/:id')
  async scanQRCodeDriver(
    @Request() req: RequestUser,
    @Param('id') driverQRId: string,
  ) {
    return await this.reporterService.scanQRCodeDriver(req.user.id, driverQRId);
  }
}
