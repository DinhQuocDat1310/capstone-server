import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { VariableConfig } from './dto';
import { ConfigJsonService } from './service';

@Controller('config-json')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Config App')
export class ConfigJsonController {
  constructor(private readonly configJsonService: ConfigJsonService) {}

  @ApiOperation({ summary: 'Load data config system' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN, Role.BRAND, Role.MANAGER)
  @Get('/list')
  loadDataConfig() {
    return this.configJsonService.listDataConfig();
  }

  @ApiBody({ type: VariableConfig })
  @ApiOperation({ summary: 'Update data config system' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/update')
  updateDataConfig(@Body() dto: VariableConfig) {
    return this.configJsonService.saveJsonDataConfig(dto);
  }
}
