import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { AppConfigService } from 'src/config/appConfigService';
import { UsersService } from 'src/user/service';
import { convertPhoneNumberFormat } from 'src/utilities';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { PrismaService } from './../prisma/service';
import { DriverVerifyInformationDTO } from './dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
  ) {}

  async updateDriverVerify(
    dto: DriverVerifyInformationDTO,
    userReq: UserSignIn,
  ) {
    const user = await this.usersService.getUserDriverInfo(
      convertPhoneNumberFormat(userReq.phoneNumber),
      userReq.role,
    );
    const latestVerifyStatus = user.driver.verify[0]?.status;
    if (latestVerifyStatus === 'NEW' || latestVerifyStatus === 'PENDING') {
      throw new BadRequestException(
        'Your account is on processing, we will reponse back in 1 to 3 working days',
      );
    }
    if (latestVerifyStatus === 'ACCEPT' || latestVerifyStatus === 'BANNED') {
      throw new BadRequestException(
        `Your account is already processed, please check your sms/phoneNumber or contact with ${this.configService.getConfig(
          'MAILER',
        )} for more information`,
      );
    }
    if (user.email !== dto.email) {
      await this.usersService.checkEmailOrPhoneNumberIsExist(
        dto.email,
        '',
        'This email is already used',
      );
    }
    if (user.idCitizen !== dto.idCitizen) {
      await this.usersService.checkIdIsExist({
        idCitizen: dto.idCitizen,
        message: 'This id card citizen is already used',
      });
    }

    if (user.driver.idCar !== dto.idCar) {
      await this.usersService.checkIdIsExist({
        idCar: dto.idCar,
        message: 'This idCar is already used',
      });
    }

    if (user.driver.bankAccountNumber !== dto.bankAccountNumber) {
      await this.usersService.checkIdIsExist({
        bankAccountNumber: dto.bankAccountNumber,
        message: 'This bank account number is already used',
      });
    }

    try {
      if (!latestVerifyStatus) {
        await this.verifyAccountService.createNewRequestVerifyDriverAccount(
          user.driver.id,
        );
      } else if (latestVerifyStatus === 'UPDATE') {
        await this.verifyAccountService.createPendingRequestVerifyDriverAccount(
          user.driver.id,
          user.driver.verify[0].managerId,
        );
      }

      await this.usersService.updateUserDriverInformation(userReq.id, dto);
      return 'updated';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async driverJoinCampaigin(campaignId: string, userReq: UserSignIn) {
    try {
      const driver = await this.prisma.driver.findFirst({
        where: {
          userId: userReq.id,
        },
      });
      const campaign = await this.prisma.campaign.findFirst({
        where: {
          id: campaignId,
        },
      });
      if (!campaign)
        throw new BadRequestException(
          'The campaignId is not exist!. Please make sure you join correct Campaign',
        );
      const listDriversJoinCampaign =
        await this.prisma.driverJoinCampaign.findMany({
          where: {
            campaignId,
          },
        });
      if (listDriversJoinCampaign.find((o) => o.driverId === userReq.id))
        throw new BadRequestException('You already join this campaign');

      if (listDriversJoinCampaign.length >= Number(campaign.quantityDriver))
        throw new BadRequestException(
          'This Campaign is full, Please join the other campaigns',
        );

      const isDriverInCampaign = await this.prisma.driverJoinCampaign.findMany({
        where: {
          driverId: driver.id,
        },
        orderBy: {
          createDate: 'desc',
        },
        include: {
          campaign: true,
        },
      });
      const latestCampaign =
        isDriverInCampaign.length !== 0 && isDriverInCampaign[0];
      if (latestCampaign) {
        if (
          ['OPEN', 'PAYMENT', 'WARPPING', 'RUNNING'].includes(
            latestCampaign.campaign.statusCampaign,
          )
        ) {
          throw new BadRequestException(
            'You are already in campaign, you cannot join two campaigns in the same time',
          );
        }
      }

      this.logger.debug(
        'Number of Drivers join campaign: ',
        listDriversJoinCampaign.length,
      );

      const isConfirmCampaign =
        listDriversJoinCampaign.length >=
        Math.floor((Number(campaign.quantityDriver) * 80) / 100);

      await this.prisma.driverJoinCampaign.create({
        data: {
          campaign: {
            connect: {
              id: campaignId,
            },
          },
          driver: {
            connect: {
              userId: userReq.id,
            },
          },
          isJoined: isConfirmCampaign ? true : false,
        },
      });
      const isUpdateAllDriverJoinCampaign =
        listDriversJoinCampaign.length + 1 ===
        Math.floor((Number(campaign.quantityDriver) * 80) / 100);
      if (isUpdateAllDriverJoinCampaign) {
        this.logger.log('Tada >= 80% driver :)), enough for campaign working');
        const listDriver = await this.prisma.driverJoinCampaign.findMany({
          where: {
            campaignId,
          },
        });
        await this.prisma.driverJoinCampaign.updateMany({
          where: {
            campaignId,
          },
          data: {
            isJoined: true,
          },
        });
        for (let i = 0; i <= listDriver.length; i++) {
          await this.prisma.driverJoinCampaign.deleteMany({
            where: {
              driverId: listDriver[i].driverId,
              isJoined: false,
            },
          });
        }
      }
    } catch (e) {
      this.logger.error(e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async getListCampaigns(address: string) {
    return this.prisma.campaign.findMany({
      where: {
        locationCampaign: {
          locationName: address,
        },
      },
    });
  }
}
