import { UserStatus, Role } from '@prisma/client';
import { FAQDto } from './dto';
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
import { FaqService } from './service';
import { Roles, Status } from 'src/guard/decorators';

@Controller('faq')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiBearerAuth('access-token')
@ApiTags('FAQs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @ApiBody({ type: FAQDto })
  @ApiOperation({ summary: 'Create a FAQ' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Post('/create')
  async createManager(@Body() dto: FAQDto) {
    return await this.faqService.createFAQ(dto);
  }

  @ApiOperation({ summary: 'View list FAQs' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN, Role.BRAND, Role.MANAGER)
  @Get('/list')
  async viewListFAQ() {
    return await this.faqService.viewListFAQs();
  }

  @ApiOperation({ summary: 'Enable a FAQ by FAQId' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/enable/:id')
  async enableFaq(@Param('id') id: string) {
    return await this.faqService.enableFaq(id);
  }

  @ApiOperation({ summary: 'Disable a FAQ by FAQId' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.ADMIN)
  @Get('/disable/:id')
  async disableFaq(@Param('id') id: string) {
    return await this.faqService.disableFaq(id);
  }
}
