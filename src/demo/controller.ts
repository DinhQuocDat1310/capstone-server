import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
import { Role, StatusUser } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { globalDateDTO, globalHourDTO } from './dto';
import { DemoService } from './service';

@Controller('demo')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiTags('Demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @ApiOperation({ summary: 'Get global date' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Get('/getGlobalDate')
  async getGlobalDate() {
    return await this.demoService.getGlobalDate();
  }

  @ApiOperation({ summary: 'Get global hour' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Get('/getGlobalHour')
  async getGlobalHour() {
    return await this.demoService.getGlobalHour();
  }

  @ApiOperation({ summary: 'Reset global date' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Post('/resetGlobalDate')
  async resetGlobalDate() {
    return await this.demoService.resetGlobalDate();
  }

  @ApiBody({ type: globalDateDTO })
  @ApiOperation({ summary: 'set global date' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/setGlobalDate')
  async setGlobalDate(@Body() global: globalDateDTO) {
    return await this.demoService.setGlobalDate(new Date(global.date));
  }

  @ApiBody({ type: globalHourDTO })
  @ApiOperation({ summary: 'set global hour' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/setGlobalHour')
  async setGlobalHour(@Body() global: globalHourDTO) {
    return await this.demoService.setGlobalHour(global.hour);
  }

  @ApiOperation({ summary: 'Get list campaigns demo' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/getListCampaigns')
  async getListCampaigns() {
    return await this.demoService.getListCampaigns();
  }

  // @Sse('sse')
  // async sse(): Promise<Observable<MessageEvent>> {
  //   return await this.demoService.getListCampaigns();
  // }
}
