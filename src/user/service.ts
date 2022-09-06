import { AppConfigService } from './../config/appConfigService';
import {
  BadRequestException,
  Body,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/service';
import { CreateUserDTO } from './dto';
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
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
      if (isExists)
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Account already exists',
        });
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

  async findBrandByUserId(userId: string) {
    return await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        brand: true,
      },
    });
  }

  async checkBrandAlreadyHaveUniqueData(email: string) {
    return await this.prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        identityCard: {
          select: {
            no: true,
          },
        },
        brand: {
          select: {
            businessLicense: {
              select: {
                idLicense: true,
              },
            },
          },
        },
      },
    });
  }

  async checkIdLicenseAndIdCard(idLicense: string, no: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            brand: {
              businessLicense: {
                idLicense,
              },
            },
          },
          {
            identityCard: {
              no,
            },
          },
        ],
      },
    });
  }

  async checkIdLicense(idLicense: string) {
    return await this.prisma.user.findFirst({
      where: {
        brand: {
          businessLicense: {
            idLicense,
          },
        },
      },
    });
  }

  async checkIdCardNumber(no: string) {
    return await this.prisma.user.findFirst({
      where: {
        identityCard: {
          no,
        },
      },
    });
  }
  async checkPermissionUser(userStatus: UserStatus) {
    if (
      UserStatus.BANNED === userStatus ||
      UserStatus.DISABLED === userStatus
    ) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `Your account is invalid. Please contact: ${this.configService.getConfig(
          'MAILER',
        )} for more information.`,
      });
    }
  }
}
