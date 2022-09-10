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
//@UseGuards(JwtAuthGuard, RolesGuard)
//@Roles(Role.MANAGER)
@ApiTags('Manager')
export class ManagerController {
  constructor(
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly managerService: ManagerService,
  ) {}

  @ApiOperation({ summary: 'Verify account by Manager' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('verify')
  async verifyAccount(
    @Request() req: RequestUser,
    @Body() dto: ManagerVerifyDTO,
  ) {
    return await this.verifyAccountService.verifyAccount(req.user.id, dto);
  }

  @Get('verify')
  async getListVerify(@Request() req: RequestUser) {
    return await this.verifyAccountService.getListVerifyPendingByManagerId(
      req.user.id,
      undefined,
    );
  }
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.MANAGER)
  @Get('verify/:role')
  async getListVerifyByRole(
    @Request() req: RequestUser,
    @Param('role') role: Role,
  ) {
    return await this.verifyAccountService.getListVerifyPendingByManagerId(
      req.user.id,
      role,
    );
  }

  @ApiOperation({ summary: 'test' })
  @ApiBearerAuth('access-token')
  @Roles(Role.MANAGER)
  @UseGuards(JwtAuthGuard)
  @Get('fake/autoAssignForManager')
  async test(@Param('status') status: VerifyAccountStatus) {
    return await this.managerService.listManagerHandleTask(status);
  }

  @Get('fake/getListVerifyNEW')
  async test2() {
    return await this.verifyAccountService.getAllVerifyNew();
  }

  @Get('fake/autoCreateNewRequest')
  async addFakeData() {
    return this.verifyAccountService.fakeAutoCreateVerifyRequest();
  }
}
