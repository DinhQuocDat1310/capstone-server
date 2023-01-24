import { StatusUser, Role } from '@prisma/client';
import { TermDto } from './dto';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { TermService } from './service';
import { Roles, Status } from 'src/guard/decorators';

@Controller('term')
@ApiTags('Term')
export class TermController {
  constructor(private readonly termService: TermService) {}

  @ApiBody({ type: TermDto })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @ApiOperation({ summary: 'Create a Term' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/create')
  async createFAQ(@Body() dto: TermDto) {
    return await this.termService.createTerm(dto);
  }

  @ApiOperation({ summary: 'View list Terms for User' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get('/list/user')
  async viewListTermUser() {
    return await this.termService.viewListTermUser();
  }

  @ApiOperation({ summary: 'View list Terms for Admin' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Roles(Role.ADMIN)
  @Status(StatusUser.VERIFIED)
  @Get('/list/admin')
  async viewListTermAdmin() {
    return await this.termService.viewListTermAdmin();
  }

  @ApiOperation({ summary: 'Enable a Term by TermId' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/enable/:id')
  async enableTerm(@Param('id') id: string) {
    return await this.termService.enableTerm(id);
  }

  @ApiOperation({ summary: 'Disable a Term by TermId' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(StatusUser.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/disable/:id')
  async disableTerm(@Param('id') id: string) {
    return await this.termService.disableTerm(id);
  }
}
