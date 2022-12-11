import { Body, Controller, Get, Post, Sse, UseGuards } from '@nestjs/common';
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
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { globalDateDTO } from './dto';
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

  @ApiBody({ type: globalDateDTO })
  @ApiOperation({ summary: 'Get global date' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/setGlobalDate')
  async setGlobalDate(@Body() global: globalDateDTO) {
    return await this.demoService.setGlobalDate(global.date);
  }

  @ApiOperation({ summary: 'Get list campaigns demo' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(UserStatus.VERIFIED)
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