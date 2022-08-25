import {
  BadRequestException,
  Body,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import { hash } from 'bcrypt';
import { AppConfigService } from 'src/config/appConfigService';
import { PrismaService } from 'src/prisma/service';
import { CreateUserDTO } from './dto';
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfigService: AppConfigService,
  ) {}
  async create(@Body() dto: CreateUserDTO) {
    const hashPassword = await hash(dto.password, 10);
    const { brandName, role, ...user } = dto;
    const data = {
      ...user,
      role,
      password: hashPassword,
    };
    data[role.toLowerCase()] = {
      create:
        role === Role.BRAND
          ? {
              brandName,
            }
          : {},
    };
    try {
      const isExists = await this.findUserByCredentials(
        user.email,
        user.phoneNumber,
      );
      if (isExists) throw new BadRequestException('Account already exists');
      const newUser = await this.prisma.user.create({
        data,
      });
      return {
        statusCode: HttpStatus.CREATED,
        data: role === Role.DRIVER ? newUser.phoneNumber : newUser.email,
      };
    } catch (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateStatusUserByEmail(email: string, status: UserStatus) {
    await this.prisma.user.update({
      where: { email },
      data: {
        status,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: { email },
    });
  }

  async findUserByCredentials(email: string, phoneNumber: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          { phoneNumber },
        ],
      },
    });
  }

  async updateUserStatusByPhone(phoneNumber: string, status: UserStatus) {
    await this.prisma.user.update({
      where: { phoneNumber },
      data: {
        status,
      },
    });
  }

  async findUserByPhone(phoneNumber: string) {
    return await this.prisma.user.findFirst({
      where: { phoneNumber },
    });
  }
}
