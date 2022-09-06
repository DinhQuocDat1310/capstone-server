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
  @ApiCreatedResponse({
    status: HttpStatus.CREATED,
    description: 'Created success',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Account already existed',
  })
  @ApiOperation({ summary: 'Create user' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUser: CreateUserDTO) {
    return await this.userService.create(createUser);
  }
}
