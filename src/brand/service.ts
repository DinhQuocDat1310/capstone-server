import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { AppConfigService } from 'src/config/appConfigService';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { PrismaService } from './../prisma/service';
import { UsersService } from './../user/service';
import { BrandVerifyInformationDTO, UpdateBrandLogoDto } from './dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly configService: AppConfigService,
  ) {}

  async updateBrandVerify(dto: BrandVerifyInformationDTO, userReq: UserSignIn) {
    const user = await this.usersService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    const latestVerifyStatus = user.brand.verify[0]?.status;
    if (latestVerifyStatus === 'NEW' || latestVerifyStatus === 'PENDING') {
      throw new BadRequestException(
        'Your account is on processing, we will reponse back in 1 to 3 working days',
      );
    }
    if (latestVerifyStatus === 'ACCEPT' || latestVerifyStatus === 'BANNED') {
      throw new BadRequestException(
        `Your account is already processed, please check your email or contact with ${this.configService.getConfig(
          'MAILER',
        )} for more information`,
      );
    }
    if (user.idCitizen !== dto.idCitizen) {
      await this.usersService.checkIdCardIsExist(dto.idCitizen);
    }
    if (user.brand.idLicenseBusiness !== dto.idLicense) {
      await this.usersService.checkIdLicenseIsExist(dto.idLicense);
    }

    try {
      if (!latestVerifyStatus) {
        await this.verifyAccountService.createNewRequestVerifyBrandAccount(
          user.brand.id,
        );
      } else if (latestVerifyStatus === 'UPDATE') {
        await this.verifyAccountService.createPendingRequestVerifyBrandAccount(
          user.brand.id,
          user.brand.verify[0].managerId,
        );
      }
      await this.usersService.updateUserBrandInformation(userReq.id, dto);
      return 'updated';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async updateBrandLogo(logo: UpdateBrandLogoDto, userReq: UserSignIn) {
    const user = await this.usersService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    try {
      await this.usersService.updateLogoBrand(user.id, logo);
      return 'updated';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getDriverCheckpointByIdAndTime(
    driverJoinCampaignId: string,
    date: Date,
  ) {
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    let driverScanQRToday = await this.prisma.driverScanQRCode.findMany({
      where: {
        driverJoinCampaignId,
        createDate: {
          lte: end,
          gte: start,
        },
      },
      include: {
        CheckpointTime: {
          select: {
            deadline: true,
            checkpoint: {
              select: {
                addressName: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
      },
    });
    if (driverScanQRToday.length === 0) {
      const globalDate: Date = new Date(date);

      const start = new Date(globalDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(globalDate);
      end.setUTCHours(23, 59, 59, 999);

      const driver = await this.prisma.driverJoinCampaign.findFirst({
        where: {
          id: driverJoinCampaignId,
        },
        select: {
          campaign: {
            select: {
              route: {
                include: {
                  checkpointTime: true,
                },
              },
            },
          },
        },
      });

      const check = driver.campaign.route.checkpointTime;
      for (let i = 0; i < check.length; i++) {
        await this.prisma.driverScanQRCode.create({
          data: {
            checkpointTimeId: check[i].id,
            driverJoinCampaignId,
            createDate: globalDate,
          },
        });
      }
      driverScanQRToday = await this.prisma.driverScanQRCode.findMany({
        where: {
          driverJoinCampaignId,
          createDate: {
            lte: end,
            gte: start,
          },
        },
        include: {
          CheckpointTime: {
            select: {
              deadline: true,
              checkpoint: {
                select: {
                  addressName: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      });
    }
    driverScanQRToday.sort(
      (c1, c2) =>
        Number(c1.CheckpointTime.deadline.split(':')[0]) -
        Number(c2.CheckpointTime.deadline.split(':')[0]),
    );
    const drivingPhotoReport = await this.prisma.drivingPhotoReport.findMany({
      where: {
        driverJoinCampaignId,
        createDate: {
          lte: end,
          gte: start,
        },
      },
    });
    return {
      driverScanQRCode: driverScanQRToday.map((d) => {
        return {
          ...d,
          submitTime: new Date(d.submitTime).toLocaleDateString('vn-VN', {
            year: 'numeric',
            day: 'numeric',
            month: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
          }),
        };
      }),
      drivingPhotoReport: drivingPhotoReport,
    };
  }
}
