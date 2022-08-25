import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  ValidateIf,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Matches,
  IsNumberString,
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
  @Matches(/\+(84[3|5|7|8|9])+([0-9]{8})\b/, {
    message: 'Phone number format: +84xxxxxxxxx',
  })
  @MaxLength(14)
  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}
