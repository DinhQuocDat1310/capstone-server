import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role, VerifyAccountStatus } from '@prisma/client';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { ManagerVerifyDTO } from './dto';
import { ManagerService } from './service';

@Controller('manager')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
@ApiTags('Manager')
export class ManagerController {
  constructor(
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly managerService: ManagerService,
  ) {}

  @ApiOperation({ summary: 'Verify account by Manager' })
  @ApiBody({ type: ManagerVerifyDTO })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('account/verify')
  async verifyAccount(
    @Request() req: RequestUser,
    @Body() dto: ManagerVerifyDTO,
  ) {
    return await this.verifyAccountService.verifyAccount(req.user.id, dto);
  }

  @Get('account/verify/:role')
  async getListVerifyByRole(
    @Request() req: RequestUser,
    @Param('role') role: string,
  ) {
    return await this.verifyAccountService.getListVerifyPendingByManagerId(
      req.user.id,
      role.toLowerCase(),
    );
  }

  @Get('fake/autoCreateNewRequest')
  async addFakeData() {
    return this.verifyAccountService.fakeAutoCreateVerifyRequest();
  }
}
