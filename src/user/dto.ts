import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  IsString,
  IsEmail,
  ValidateIf,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, description: 'fullname' })
  fullname?: string;

  @IsString()
  @ValidateIf((user) => user.role === 'BRAND')
  @ApiProperty({ type: String, description: 'brandName' })
  brandName?: string;

  @IsEmail()
  @ValidateIf((user) => user.email !== undefined || user.role === 'BRAND')
  @ApiProperty({ type: String, description: 'email' })
  email?: string;

  @IsEnum([Role.BRAND, Role.DRIVER], {
    message: 'Role must be following format: [BRAND, DRIVER]',
  })
  @ApiProperty({ enum: [Role.BRAND, Role.DRIVER], description: 'role' })
  role: Role;

  @ValidateIf(
    (user) => user.phoneNumber !== undefined || user.role === 'DRIVER',
  )
  @IsString()
  @Matches(/^0\d{9}/, {
    message: 'Incorrect phone number format. Please input 10 digits',
  })
  @ApiProperty({ type: String, description: 'phoneNumber' })
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}
