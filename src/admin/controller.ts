import { RequestUser } from 'src/auth/dto';
import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Param,
  Put,
  Request,
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
import { UserStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { AdminService } from './service';
import { AssignDto, ManagerDTO } from 'src/manager/dto';
import { LocationService } from 'src/location/service';
import { CreateLocationDTO, UpdateLocationDTO } from 'src/location/dto';
import { WrapDTO } from 'src/wrap/dto';
import { WrapService } from 'src/wrap/service';

@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@Controller('admin')
@ApiBearerAuth('access-token')
@ApiTags('Admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly locationService: LocationService,
    private readonly wrapService: WrapService,
  ) {}

  @ApiBody({ type: ManagerDTO })
  @ApiOperation({ summary: 'Create a Manager' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('manager/create')
  async createManager(@Body() dto: ManagerDTO) {
    return await this.adminService.createManager(dto);
  }

  @ApiOperation({ summary: 'Get list Managers' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('manager/list')
  async getListManager() {
    return await this.adminService.getListManager();
  }

  @ApiOperation({ summary: 'Enable a Manager by ManagerId' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/manager/enable/:id')
  async enableManager(@Param('id') managerId: string) {
    return await this.adminService.enableManager(managerId);
  }

  @ApiOperation({ summary: 'Disable a Manager by ManagerId' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/manager/disable/:id')
  async disableManager(@Param('id') managerId: string) {
    return await this.adminService.disableManager(managerId);
  }

  @ApiOperation({ summary: 'View manager task details by ManagerId' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/manager/detail/:id')
  async viewTaskDetailManager(@Param('id') managerId: string) {
    return await this.adminService.viewTaskDetailManager(managerId);
  }

  @ApiOperation({ summary: 'View list tasks NEW' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/manager/list/tasks')
  async viewListTaskNew() {
    return await this.adminService.viewListTaskNew();
  }

  @ApiOperation({ summary: 'View list managers Active' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/manager/list/active')
  async viewManagerActive() {
    return await this.adminService.viewListManagerActive();
  }

  @ApiOperation({ summary: 'Assign task to Manager' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/manager/assign/task')
  async assignTaskToManager(@Body() assignDto: AssignDto) {
    return await this.adminService.assignTaskToManager(assignDto);
  }

  @ApiOperation({ summary: 'Get list location' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get('/locations')
  async getListLocation(@Request() userReq: RequestUser) {
    return await this.locationService.getListLocation(userReq.user.role);
  }

  @ApiBody({ type: CreateLocationDTO })
  @ApiOperation({ summary: 'Create location' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/location')
  async createLocation(@Body() dto: CreateLocationDTO) {
    return await this.locationService.createNewLocation(dto);
  }

  @ApiBody({ type: UpdateLocationDTO })
  @ApiOperation({ summary: 'Update location' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Put('/location')
  async updateLocation(@Body() dto: UpdateLocationDTO) {
    return await this.locationService.updateLocation(dto);
  }

  @ApiOperation({ summary: 'Get list wrap' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN, Role.MANAGER)
  @Get('/wraps')
  async getListWrap(@Request() userReq: RequestUser) {
    return await this.wrapService.getListWrap(userReq.user.role);
  }

  @ApiBody({ type: WrapDTO })
  @ApiOperation({ summary: 'Update wrap' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Put('/wrap')
  async updateWrap(@Body() dto: WrapDTO) {
    return await this.wrapService.updateWrap(dto);
  }
}
