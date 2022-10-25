import { Status } from './../guard/decorators';
import { PolicyDto } from './dto';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PolicyService } from './service';
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
import { Roles } from 'src/guard/decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';

@Controller('policy')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Policies')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @ApiBody({ type: PolicyDto })
  @ApiOperation({ summary: 'Create a Policy' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/create')
  async createPolicy(@Body() dto: PolicyDto) {
    return await this.policyService.createPolicy(dto);
  }

  @ApiOperation({ summary: 'View list Policies' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN, Role.BRAND, Role.MANAGER)
  @Get('/list')
  async viewListPolicy() {
    return await this.policyService.viewListPolicy();
  }

  @ApiOperation({ summary: 'Enable a Policy by PolicyId' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/enable/:id')
  async enablePolicy(@Param('id') id: string) {
    return await this.policyService.enablePolicy(id);
  }

  @ApiOperation({ summary: 'Disable a Policy by PolicyId' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/disable/:id')
  async disablePolicy(@Param('id') id: string) {
    return await this.policyService.disablePolicy(id);
  }
}
