import { ManagerDTO } from 'src/manager/dto';
import {
  BadRequestException,
  Body,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role, StatusUser } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { PrismaService } from 'src/prisma/service';
import { ChangePasswordDTO, CreateUserDTO, CreateReporterDTO } from './dto';
import { UserSignIn } from 'src/auth/dto';
import { DriverVerifyInformationDTO } from 'src/driver/dto';
import { BrandVerifyInformationDTO, UpdateBrandLogoDto } from 'src/brand/dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(@Body() dto: CreateUserDTO) {
    const { brandName, fullname, role, email, password } = dto;
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
      await this.checkEmailIsExist(
        email ?? '',
        'Your account is already exist',
      );
      if (role === 'BRAND') {
        await this.checkBrandNameIsExist(brandName);
      } else {
        data['fullname'] = fullname;
      }
      data['email'] = email;
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

  async updateStatusUserByUserId(id: string, status: StatusUser) {
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
        status: StatusUser.PENDING,
        imageCitizenBack: dto.imageCitizenBack,
        imageCitizenFront: dto.imageCitizenFront,
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
        idCitizen: dto.idCitizen,
        status: StatusUser.PENDING,
        imageCitizenBack: dto.imageCitizenBack,
        imageCitizenFront: dto.imageCitizenFront,
        email: dto.email,
        address: dto.address,
        driver: {
          update: {
            licensePlates: dto.licensePlates,
            imageCarBack: dto.imageCarBack,
            imageCarFront: dto.imageCarFront,
            imageCarLeft: dto.imageCarLeft,
            imageCarRight: dto.imageCarRight,
          },
        },
      },
      include: {
        driver: true,
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: {
        email,
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

  async checkEmailIsExist(email: string, message: string) {
    const user = await this.findUserByEmail(email);
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

  async getBrandInfo(userId: string) {
    return await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        brand: true,
      },
    });
  }

  async getUserDriverInfo(email: string, role: Role) {
    return await this.prisma.user.findFirst({
      where: {
        email,
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
    licensePlates = '',
    message = '',
  }: {
    idCitizen?: string;
    licensePlates?: string;
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
              licensePlates,
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
    const { email, fullname, password } = dto;
    const hashPassword = await hash(password, 10);
    return await this.prisma.user.create({
      data: {
        fullname,
        email,
        role: Role.MANAGER,
        password: hashPassword,
        status: StatusUser.VERIFIED,
      },
      select: {
        id: true,
      },
    });
  }

  async createNewReporter(dto: CreateReporterDTO) {
    const { address, fullname, email, password } = dto;
    const hashPassword = await hash(password, 10);
    const data = {
      role: Role.REPORTER,
      password: hashPassword,
      address,
      fullname,
      email,
      status: StatusUser.VERIFIED,
      reporter: {
        create: {},
      },
    };

    try {
      await this.checkEmailIsExist(
        email ?? '',
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
}
