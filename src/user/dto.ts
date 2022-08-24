import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  ValidateIf,
  IsEnum,
  IsNumberString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, description: 'fullname' })
  fullname: string;

  @IsString()
  @ValidateIf((user) => user.role === 'BRAND')
  @ApiProperty({ type: String, description: 'brandName' })
  brandName: string;

  @IsEmail()
  @ValidateIf((user) => user.role === 'BRAND')
  @ApiProperty({ type: String, description: 'email' })
  email: string;

  @IsEnum(Role, { message: 'Role: [ADMIN, BRAND, DRIVER, MANAGER]' })
  @ApiProperty({ enum: Role, description: 'role' })
  role: Role;

  @IsNumberString()
  @ValidateIf((user) => user.role === 'DRIVER')
  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}
