import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { PrismaService } from 'src/prisma/service';
import { ChangePasswordDTO, CreateUserDTO } from './dto';
import { convertPhoneNumberFormat } from 'src/utilities';
import { UserSignIn } from 'src/auth/dto';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
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
      if (role === 'BRAND') await this.checkBrandNameIsExist(brandName);
      await this.checkEmailOrPhoneNumberIsExist(
        user.email ?? '',
        user.phoneNumber ?? '',
        'Your account is already exist',
      );
      await this.prisma.user.create({
        data,
      });
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async updatePasswordUser(userId: string, dto: ChangePasswordDTO) {
    const user = await this.findUserByUserId(userId);
    if (user && (await compare(dto.currentPassword, user.password))) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: await hash(dto.newPassword, 10),
        },
      });
      return 'Updated';
    }
    throw new BadRequestException('Incorrect current password of user');
  }

  async findUserByUserId(id: string) {
    return await this.prisma.user.findFirst({
      where: {
        id,
      },
    });
  }

  async getUserAuthorization(userReq: UserSignIn) {
    const include = {};
    if (userReq.role && userReq.role !== 'ADMIN') {
      include[`${userReq.role.toLowerCase()}`] = true;
    }
    const user = await this.prisma.user.findFirst({
      where: {
        id: userReq.id,
      },
      include,
    });
    const { password, ...result } = user;
    return result;
  }

  async updateStatusUserByUserId(id: string, status: UserStatus) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async findUserByEmailOrPhoneNumber(email: string, phoneNumber: string) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            phoneNumber: convertPhoneNumberFormat(phoneNumber),
          },
        ],
      },
    });
  }

  async checkBrandNameIsExist(brandName: string) {
    const brand = await this.prisma.user.findFirst({
      where: {
        brand: {
          brandName,
        },
      },
    });
    if (brand)
      throw new BadRequestException('This brand name is already exist!');
  }

  async checkEmailOrPhoneNumberIsExist(
    email: string,
    phoneNumber: string,
    message: string,
  ) {
    const user = await this.findUserByEmailOrPhoneNumber(email, phoneNumber);
    if (user) throw new BadRequestException(message);
  }

  async getUserBrandInfo(email: string, role: Role) {
    return this.prisma.user.findFirst({
      where: {
        email,
        role,
      },
      include: {
        brand: {
          include: {
            verify: {
              orderBy: {
                createDate: 'desc',
              },
            },
          },
        },
      },
    });
  }

  async checkIdCardIsExist(idCitizen: string) {
    const card = await this.prisma.user.findFirst({
      where: {
        idCitizen,
      },
    });
    if (card)
      throw new BadRequestException('This id card citizen is already used');
  }

  async checkIdLicenseIsExist(idLicenseBusiness: string) {
    const license = await this.prisma.brand.findFirst({
      where: {
        idLicenseBusiness,
      },
    });
    if (license)
      throw new BadRequestException('This id business license is already used');
  }
}
