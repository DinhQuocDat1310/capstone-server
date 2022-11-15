import { UsersService } from 'src/user/service';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
@Injectable()
export class ReporterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}
  async getListReporter() {
    const listReporters = await this.usersService.getListReporters();
    if (listReporters.length === 0) {
      throw new BadRequestException('Not found any Reporter');
    }
    return listReporters;
  }

  async getListCampaignInReporterLocation(reporterId: string) {
    const checkReporterId = await this.prisma.reporter.findFirst({
      where: {
        id: reporterId,
      },
    });
    if (!checkReporterId) throw new BadRequestException('Not found reporterId');
    const getLocationReporter = await this.prisma.reporter.findFirst({
      where: {
        id: reporterId,
      },
      select: {
        user: {
          select: {
            address: true,
          },
        },
      },
    });

    const resultCampaign = await this.prisma.campaign.findMany({
      where: {
        locationCampaign: {
          locationName: getLocationReporter.user.address,
        },
        statusCampaign: {
          in: ['OPEN', 'PAYMENT', 'WRAPPING', 'RUNNING', 'CLOSED'],
        },
      },
      select: {
        id: true,
        campaignName: true,
        locationCampaign: {
          select: {
            locationName: true,
          },
        },
        startRunningDate: true,
        duration: true,
        quantityDriver: true,
        statusCampaign: true,
      },
    });
    for (let i = 0; i < resultCampaign.length; i++) {
      const countDriver = await this.prisma.driverJoinCampaign.count({
        where: {
          campaignId: resultCampaign[i].id,
        },
      });
      const dateEndCampaign = new Date(resultCampaign[i].startRunningDate);
      dateEndCampaign.setDate(
        dateEndCampaign.getDate() + Number(resultCampaign[i].duration),
      );

      resultCampaign[i]['endDateCampaign'] = dateEndCampaign;
      resultCampaign[i]['quantityDriverJoinning'] = countDriver;
    }
    return resultCampaign.map((campaign) => {
      const locationName = campaign.locationCampaign.locationName;
      delete campaign.locationCampaign;
      return {
        ...campaign,
        locationName,
      };
    });
  }

  async getDriverDetailByCarId(carId: string, userId: string) {
    const checkCarIdExist = await this.prisma.driver.findMany({
      where: {
        idCar: carId,
      },
    });
    if (checkCarIdExist.length === 0)
      throw new BadRequestException('Not found Car ID');
    return await this.prisma.reporterDriverCampaign.findMany({
      where: {
        reporter: {
          userId,
        },
        driverJoinCampaign: {
          driver: {
            idCar: carId,
          },
        },
      },
      select: {
        driverJoinCampaign: {
          include: {
            driver: {
              include: {
                user: true,
                campaigns: {
                  include: {
                    campaign: {
                      include: {
                        locationCampaign: true,
                        wrap: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
