import { Body, Controller, Post } from '@nestjs/common';
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
    status: 201,
    description: 'Created success',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Cannot created. Try again',
  })
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() createUser: CreateUserDTO) {
    return await this.userService.create(createUser);
  }
}
