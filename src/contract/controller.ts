import { CampaignContractDTO } from './../campaign/dto';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Param,
  Get,
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
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles, Status } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { ContractService } from './service';
import { CancelContractDTO } from './dto';

@Controller('contract')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard, StatusGuard)
@ApiTags('Contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @ApiBody({ type: CampaignContractDTO })
  @ApiOperation({ summary: 'Create contract with verify ACCEPT campaign' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({ description: 'Created' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.MANAGER)
  @Post('/create')
  async updateCampaignInformation(
    @Request() req: RequestUser,
    @Body() dto: CampaignContractDTO,
  ) {
    return await this.contractService.createCampaignContract(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Get contract by Contract ID' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.BRAND, Role.MANAGER)
  @Get('/:id')
  async getContractByContractId(@Param('id') contractId: string) {
    return await this.contractService.getContractByContractID(contractId);
  }

  @ApiOperation({ summary: 'Accept contract by Brand' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.BRAND)
  @Get('/accept/:id')
  async acceptContract(
    @Request() req: RequestUser,
    @Param('id') contractId: string,
  ) {
    return await this.contractService.acceptContract(req.user.id, contractId);
  }

  @ApiBody({ type: CancelContractDTO })
  @ApiOperation({ summary: 'Cancel contract by Brand' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Status(UserStatus.VERIFIED)
  @Roles(Role.BRAND)
  @Get('/cancel')
  async cancelContract(
    @Request() req: RequestUser,
    @Body() dto: CancelContractDTO,
  ) {
    return await this.contractService.cancelContract(req.user.id, dto);
  }
}
