import { JwtAuthGuard } from 'src/guard/auth.guard';
import { VerifyBrandService } from './service';
import {
  Body,
  Get,
  Controller,
  Post,
  HttpStatus,
  UseGuards,
  Param,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { VerifyInfoDto } from './dto';

@Controller('verify-brand')
@ApiTags('Manager verify Brand')
export class VerifyBrandController {
  constructor(private readonly verifyBrandService: VerifyBrandService) {}

  @Get('/viewHistory/:id')
  @ApiOperation({ summary: 'View list history verify data by brand' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'View list history verify success',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'View list brand verify fail',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async viewHistoryVerifyData(@Param('id') idBrand: string) {
    return await this.verifyBrandService.viewHistoryVerifyData(idBrand);
  }

  @Get('/viewListVerify/:email')
  @ApiOperation({ summary: 'View list verifying by manager email' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'View list brand verify success',
  })
  @ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not found account email manager',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'View list brand verify fail',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Task this manager is empty',
  })
  @ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Account is invalid. Contact Admin',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async listVerifyBrand(@Param('email') email: string) {
    return await this.verifyBrandService.viewListVerifyByManager(email);
  }

  @Post('/accept')
  @ApiBody({ type: VerifyInfoDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Account accepted',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Accept failed',
  })
  @ApiOperation({ summary: 'Accept account' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async acceptVerifyBrand(@Body() verifyInfoDto: VerifyInfoDto) {
    return await this.verifyBrandService.acceptBrandByManager(verifyInfoDto);
  }

  @Post('/request-change')
  @ApiBody({ type: VerifyInfoDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Account request change',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Request change failed',
  })
  @ApiOperation({ summary: 'Request change data account' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestChangeBrand(@Body() verifyInfoDto: VerifyInfoDto) {
    return await this.verifyBrandService.requestChangeBrandByManager(
      verifyInfoDto,
    );
  }

  @Post('/denied')
  @ApiBody({ type: VerifyInfoDto })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Account banned',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Banned failed',
  })
  @ApiOperation({ summary: 'Banned account' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deniedBrand(@Body() verifyInfoDto: VerifyInfoDto) {
    return await this.verifyBrandService.deniedBrandByManager(verifyInfoDto);
  }
}
