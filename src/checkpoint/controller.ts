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
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { CheckpointDTO, RouteDTO } from './dto';
import { CheckPointService } from './service';

@Controller('checkpoint')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('Checkpoint')
export class CheckPointController {
  constructor(private readonly checkpointService: CheckPointService) {}

  @ApiBody({ type: CheckpointDTO })
  @ApiOperation({ summary: 'Create checkpoint' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Roles(Role.ADMIN)
  @Post()
  async createCheckPoint(@Body() dto: CheckpointDTO) {
    return await this.checkpointService.createCheckPoint(dto);
  }

  @ApiOperation({ summary: 'get all checkpoints' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Roles(Role.ADMIN)
  @Get()
  async getCheckpoints() {
    return await this.checkpointService.getAllCheckpoints();
  }

  @ApiBody({ type: RouteDTO })
  @ApiOperation({ summary: 'Create route' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Roles(Role.ADMIN)
  @Post('route')
  async createRoute(@Body() dto: RouteDTO) {
    return await this.checkpointService.createRoute(dto);
  }

  @ApiOperation({ summary: 'Get all route' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Roles(Role.ADMIN)
  @Get('route')
  async getAllRoutes() {
    return await this.checkpointService.getAllRoutes();
  }
}
