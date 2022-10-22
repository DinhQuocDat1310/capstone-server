import { Controller, UseGuards, Post, Body, Get, Param } from '@nestjs/common';
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

@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@Controller('admin')
@ApiBearerAuth('access-token')
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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

  // @ApiOperation({ summary: 'Assign task to Manager' })
  // @ApiForbiddenResponse({ description: 'Forbidden' })
  // @ApiBadRequestResponse({ description: 'Bad Request' })
  // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @Status(UserStatus.VERIFIED)
  // @Roles(Role.ADMIN)
  // @Post('/manager/assign/task')
  // async assignTaskToManager(@Body() assignDto: AssignDto) {
  //   return await this.adminService.assignTaskToManager(assignDto);
  // }
}
