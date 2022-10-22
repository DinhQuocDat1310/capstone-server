import { VerifyCampaignService } from './../verifyCampaign/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { UserStatus } from '@prisma/client';
import { UsersService } from './../user/service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ManagerDTO, AssignDto } from 'src/manager/dto';
import { PrismaService } from 'src/prisma/service';
import { ManagerService } from 'src/manager/service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly managerService: ManagerService,
    private readonly verifyAccountsService: VerifyAccountsService,
    private readonly verifyCampaignsService: VerifyCampaignService,
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
    if (listManagers.length === 0) {
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
    const checkManagerContraistTask =
      await this.verifyAccountsService.checkManagerContraistTask(managerId);
    const checkManagerContraistTaskCampaign =
      await this.verifyCampaignsService.checkManagerContraistTaskCampaign(
        managerId,
      );
    if (
      checkManagerContraistTask.length !== 0 ||
      checkManagerContraistTaskCampaign.length !== 0
    ) {
      await this.verifyAccountsService.removeTaskAccountOutOfManager(
        checkManagerContraistTask,
      );
      await this.verifyCampaignsService.removeTaskCampaignOutOfManager(
        checkManagerContraistTaskCampaign,
      );
    }
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
      return `Disabled manager and Removed all task Pending`;
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
      const listTaskAccount = await this.verifyAccountsService.getTaskAccount(
        managerId,
      );
      const listTaskCampaign =
        await this.verifyCampaignsService.getTaskCampaign(managerId);
      return [...listTaskAccount, ...listTaskCampaign];
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async viewListTaskNew() {
    const listAccount = await this.verifyAccountsService.getAllTaskAccountNew();
    const listCampaign =
      await this.verifyCampaignsService.getAllTaskCampaignNew();
    if (listAccount.length === 0 && listCampaign.length === 0) {
      throw new BadRequestException(
        'Not found tasks verify account or tasks verify campaign',
      );
    }
    return [...listAccount, ...listCampaign];
  }

  async viewListManagerActive() {
    const listManagers = await this.managerService.getAllManagerValid();
    if (listManagers.length === 0) {
      throw new BadRequestException('Not found any manager active');
    }
    return listManagers;
  }

  // async assignTaskToManager(assignDto: AssignDto) {
  //   const verifyTaskAccount = await this.prisma.verifyAccount.findFirst({
  //     where: {
  //       id: assignDto.verifyId,
  //     },
  //   });
  //   if (!verifyTaskAccount) {
  //   }
  //   const verifyTaskCampaign = await this.prisma.verifyCampaign.findFirst;
  //   return await this.prisma.manager.update({
  //     where: {
  //       id: assignDto.managerId,
  //     },
  //     data: {},
  //   });
  // }
}
