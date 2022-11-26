import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpCode,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { RequestUser } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Status } from 'src/guard/decorators';
import { StatusGuard } from 'src/guard/userStatus.guard';
import { ChangePasswordDTO, CreateUserDTO, UserDTO } from './dto';
import { UsersService } from './service';
@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDTO })
  @ApiCreatedResponse({ description: 'created' })
  @ApiBadRequestResponse({ description: 'Account already existed' })
  @ApiOperation({ summary: 'Create new user' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUser: CreateUserDTO) {
    return await this.userService.create(createUser);
  }

  @ApiOperation({ summary: 'Get User by access token' })
  @ApiUnauthorizedResponse({ description: 'Unauthorize' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiOkResponse({ type: UserDTO })
  @UseGuards(JwtAuthGuard, StatusGuard)
  @Status(
    UserStatus.INIT,
    UserStatus.NEW,
    UserStatus.PENDING,
    UserStatus.UPDATE,
    UserStatus.VERIFIED,
  )
  @ApiBearerAuth('access-token')
  @Get()
  async getUserInformation(@Request() req: RequestUser) {
    return await this.userService.getUserAuthorization(req.user);
  }

  @ApiOperation({ summary: 'Change password user' })
  @ApiUnauthorizedResponse({ description: 'Unauthorize' })
  @ApiForbiddenResponse({
    description: "Account don't have permission to use this feature",
  })
  @ApiOkResponse()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, StatusGuard)
  @Status(
    UserStatus.INIT,
    UserStatus.NEW,
    UserStatus.PENDING,
    UserStatus.UPDATE,
    UserStatus.VERIFIED,
  )
  @Post('passsword/change')
  async changePassword(
    @Request() req: RequestUser,
    @Body() dto: ChangePasswordDTO,
  ) {
    await this.userService.updatePasswordUser(req.user.id, dto);
  }

  @Get('test')
  async testDateTime() {
    return await this.userService.test();
  }
}
