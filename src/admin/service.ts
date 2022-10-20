import { UserStatus } from '@prisma/client';
import { UsersService } from './../user/service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ManagerDTO } from 'src/manager/dto';
import { PrismaService } from 'src/prisma/service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {}

  async createManager(dto: ManagerDTO) {
    await this.userService.checkEmailOrPhoneNumberIsExist(
      dto.email,
      dto.phoneNumber,
      'Email or Phone number already used!',
    );
    try {
      const manager = await this.userService.createManager(dto);
      await this.prisma.manager.create({
        data: {
          userId: manager.id,
        },
      });
      return `Created`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListManager() {
    const listManagers = await this.userService.getListManager();
    if (!listManagers) {
      throw new BadRequestException('Not found any Managers');
    }
    return listManagers;
  }

  async enableManager(managerId: string) {
    const checkManagerIdExisted = await this.userService.checkManagerIdExisted(
      managerId,
    );
    if (!checkManagerIdExisted)
      throw new BadRequestException('ManagerId not found');
    try {
      await this.prisma.manager.update({
        where: {
          id: managerId,
        },
        data: {
          user: {
            update: {
              isActive: true,
              status: UserStatus.VERIFIED,
            },
          },
        },
      });
      return `Enabled manager`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async disableManager(managerId: string) {
    const checkManagerIdExisted = await this.userService.checkManagerIdExisted(
      managerId,
    );
    if (!checkManagerIdExisted)
      throw new BadRequestException('ManagerId not found');
    try {
      await this.prisma.manager.update({
        where: {
          id: managerId,
        },
        data: {
          user: {
            update: {
              isActive: false,
              status: UserStatus.BANNED,
            },
          },
        },
      });
      return `Disabled manager`;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async viewTaskDetailManager(managerId: string) {
    const checkManagerIdExisted = await this.userService.checkManagerIdExisted(
      managerId,
    );
    if (!checkManagerIdExisted)
      throw new BadRequestException('ManagerId not found');
    try {
      return await this.prisma.manager.findMany({
        where: {
          id: managerId,
        },
        select: {
          verify: {
            include: {
              manager: {},
            },
            orderBy: {
              createDate: 'asc',
            },
          },
          verifyCampaign: {
            include: {
              manager: {},
              campaign: {},
            },
            orderBy: {
              createDate: 'asc',
            },
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
