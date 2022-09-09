import { Body, Controller, Post, HttpStatus, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDTO } from './dto';
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
}
