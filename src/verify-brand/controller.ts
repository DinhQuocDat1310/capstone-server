import { VerifyBrandService } from './service';
import { Body, Controller, Post, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { VerifyInfoDto } from './dto';

@Controller('verify-brand')
@ApiTags('Manager verify Brand')
export class VerifyBrandController {
  constructor(private readonly verifyBrandService: VerifyBrandService) {}

  @Post('/accept')
  @ApiBody({ type: VerifyInfoDto })
  @ApiOkResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Account accepted',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Accept failed',
  })
  @ApiOperation({ summary: 'Accept account' })
  async acceptVerifyBrand(@Body() verifyInfoDto: VerifyInfoDto) {
    return await this.verifyBrandService.acceptBrandByManager(verifyInfoDto);
  }

  @Post('/request-change')
  @ApiBody({ type: VerifyInfoDto })
  @ApiOkResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Account request change',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Request change failed',
  })
  @ApiOperation({ summary: 'Request change data account' })
  async requestChangeBrand(@Body() verifyInfoDto: VerifyInfoDto) {
    return await this.verifyBrandService.requestChangeBrandByManager(
      verifyInfoDto,
    );
  }

  @Post('/denied')
  @ApiBody({ type: VerifyInfoDto })
  @ApiOkResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Account denied',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Denied failed',
  })
  @ApiOperation({ summary: 'Denied account' })
  async listVerifyBrand(@Body() verifyInfoDto: VerifyInfoDto) {
    return await this.verifyBrandService.deniedBrandByManager(verifyInfoDto);
  }
}
