import {
  Body,
  Controller,
  Get,
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
import { Role, UserStatus } from '@prisma/client';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { DriverVerifyInformationDTO } from './dto';
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
  @Status(UserStatus.NEW, UserStatus.UPDATE)
  @Roles(Role.DRIVER)
  @Post('account/verify')
  async updateBrandInformation(
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
  @Status(UserStatus.UPDATE)
  @Get('account/verify')
  async getListVerifyBrand(@Request() req: RequestUser) {
    return await this.verifyAccountService.getListVerifyByUserId(req.user.id);
  }
}
