import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyInfoDto {
  @IsString()
  @ApiProperty({ type: String, description: 'idVerify' })
  idVerify: string;
  @ApiProperty({ type: String, description: 'detail' })
  detail: object;
  @IsEmail()
  @ApiProperty({ type: String, description: 'email' })
  email: string;
  @ApiProperty({ type: [String], description: 'field error' })
  fieldError: string[];
  @ApiProperty({ type: [String], description: 'message error' })
  messageError: string[];
}
