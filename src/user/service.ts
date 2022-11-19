import { ManagerDTO } from 'src/manager/dto';
import {
  BadRequestException,
  Body,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role, UserStatus } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { PrismaService } from 'src/prisma/service';
import { ChangePasswordDTO, CreateUserDTO } from './dto';
import { convertPhoneNumberFormat } from 'src/utilities';
import { UserSignIn } from 'src/auth/dto';
import { DriverVerifyInformationDTO } from 'src/driver/dto';
import { BrandVerifyInformationDTO, UpdateBrandLogoDto } from 'src/brand/dto';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(@Body() dto: CreateUserDTO) {
    const { brandName, phoneNumber, role, email, password } = dto;
    const hashPassword = await hash(password, 10);
    const data = {
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
      await this.checkEmailOrPhoneNumberIsExist(
        email ?? '',
        phoneNumber ?? '',
        'Your account is already exist',
      );
      if (role === 'BRAND') {
        data['email'] = email;
        await this.checkBrandNameIsExist(brandName);
      }
      if (role === 'DRIVER') {
        data['phoneNumber'] = convertPhoneNumberFormat(phoneNumber);
      }
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
    const checkCurrentPassword = await compare(
      dto.currentPassword,
      user.password,
    );
    if (!checkCurrentPassword)
      throw new BadRequestException('Incorrect current password of user');
    if (user && checkCurrentPassword) {
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
    throw new InternalServerErrorException('Server error');
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
    let user = {};
    if (userReq.role && userReq.role !== 'ADMIN') {
      include[`${userReq.role.toLowerCase()}`] = true;
      user = await this.prisma.user.findFirst({
        where: {
          id: userReq.id,
        },
        include,
      });
    }
    if (userReq.role && userReq.role === 'ADMIN') {
      user = await this.prisma.user.findFirst({
        where: {
          id: userReq.id,
        },
        select: {
          id: true,
          email: true,
          fullname: true,
          role: true,
          isActive: true,
          status: true,
        },
      });
    }
    return user;
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

  async updateUserBrandInformation(id: string, dto: BrandVerifyInformationDTO) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        idCitizen: dto.idCitizen,
        status: UserStatus.PENDING,
        imageCitizenBack: dto.imageCitizenBack,
        imageCitizenFront: dto.imageCitizenFront,
        phoneNumber: convertPhoneNumberFormat(dto.phoneNumber),
        address: dto.address,
        brand: {
          update: {
            ownerLicenseBusiness: dto.ownerLicenseBusiness,
            logo: dto.logo,
            idLicenseBusiness: dto.idLicense,
            typeBusiness: dto.typeBusiness,
            imageLicenseBusiness: dto.imageLicenseBusiness,
          },
        },
      },
      include: {
        brand: true,
      },
    });
  }

  async updateLogoBrand(id: string, dto: UpdateBrandLogoDto) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        brand: {
          update: {
            logo: dto.logo,
          },
        },
      },
      include: {
        brand: true,
      },
    });
  }

  async updateUserDriverInformation(
    id: string,
    dto: DriverVerifyInformationDTO,
  ) {
    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        fullname: dto.fullname,
        idCitizen: dto.idCitizen,
        status: UserStatus.PENDING,
        imageCitizenBack: dto.imageCitizenBack,
        imageCitizenFront: dto.imageCitizenFront,
        email: dto.email,
        address: dto.address,
        driver: {
          update: {
            idCar: dto.idCar,
            imageCarBack: dto.imageCarBack,
            imageCarFront: dto.imageCarFront,
            imageCarLeft: dto.imageCarLeft,
            imageCarRight: dto.imageCarRight,
            bankAccountNumber: dto.bankAccountNumber,
            bankName: dto.bankName,
            bankAccountOwner: dto.bankAccountOwner,
          },
        },
      },
      include: {
        driver: true,
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
    return await this.prisma.user.findFirst({
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

  async getUserDriverInfo(phoneNumber: string, role: Role) {
    return await this.prisma.user.findFirst({
      where: {
        phoneNumber,
        role,
      },
      include: {
        driver: {
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

  async checkIdIsExist({
    idCitizen = '',
    bankAccountNumber = '',
    idCar = '',
    message = '',
  }: {
    idCitizen?: string;
    bankAccountNumber?: string;
    idCar?: string;
    message: string;
  }) {
    const isExist = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            idCitizen,
          },
          {
            driver: {
              OR: [
                {
                  bankAccountNumber,
                },
                {
                  idCar,
                },
              ],
            },
          },
        ],
      },
    });
    if (isExist) throw new BadRequestException(message);
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

  async getListManager() {
    const users = await this.prisma.user.findMany({
      where: {
        role: Role.MANAGER,
      },
      select: {
        manager: {
          select: {
            id: true,
          },
        },
        fullname: true,
        email: true,
        phoneNumber: true,
        status: true,
        isActive: true,
      },
    });
    return users
      .map((user) => user)
      .map((user) => {
        const managerId = user?.manager?.id;
        delete user?.manager;
        return {
          managerId,
          ...user,
        };
      });
  }

  async getListReporters() {
    const users = await this.prisma.user.findMany({
      where: {
        role: Role.REPORTER,
      },
      select: {
        reporter: {
          select: {
            id: true,
          },
        },
        fullname: true,
        email: true,
        phoneNumber: true,
        status: true,
        isActive: true,
        address: true,
      },
    });
    return users
      .map((user) => user)
      .map((user) => {
        const reporterId = user?.reporter?.id;
        delete user?.reporter;
        return {
          reporterId,
          ...user,
        };
      });
  }

  async checkManagerIdExisted(managerId: string) {
    return await this.prisma.user.findFirst({
      where: {
        manager: {
          id: managerId,
        },
      },
    });
  }

  async createManager(dto: ManagerDTO) {
    const { email, fullname, phoneNumber, password } = dto;
    const hashPassword = await hash(password, 10);
    return await this.prisma.user.create({
      data: {
        fullname,
        email,
        phoneNumber: convertPhoneNumberFormat(phoneNumber),
        role: Role.MANAGER,
        password: hashPassword,
        status: UserStatus.VERIFIED,
      },
      select: {
        id: true,
      },
    });
  }
}
