import { CreateReportDriverCampaignDTO } from './dto';
import { UsersService } from 'src/user/service';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import moment from 'moment';
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
    const getLocationReporter = await this.prisma.reporter.findFirst({
      where: {
        userId,
      },
      select: {
        user: {
          select: {
            address: true,
          },
        },
      },
    });
    const dataDriver = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        driver: {
          idCar: carId,
        },
        campaign: {
          locationCampaign: {
            locationName: getLocationReporter.user.address,
          },
        },
      },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
        campaign: {
          include: {
            locationCampaign: true,
            wrap: true,
          },
        },
        reporterDriverCampaign: {
          select: {
            isChecked: true,
            createDate: true,
          },
          orderBy: {
            createDate: 'desc',
          },
        },
      },
    });
    const dateCreateCheck = dataDriver.reporterDriverCampaign[0].createDate;
    if (moment().diff(dateCreateCheck, 'days') !== 0) {
      dataDriver.reporterDriverCampaign[0].isChecked === false;
    } else {
      dataDriver.reporterDriverCampaign[0].isChecked === true;
    }
    return dataDriver;
  }

  async createReporterDriverCampaign(
    dto: CreateReportDriverCampaignDTO,
    userId: string,
  ) {
    const reporterId = await this.prisma.reporter.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });
    await this.prisma.reporterDriverCampaign.create({
      data: {
        imageCarBack: dto.imageCarBack,
        imageCarLeft: dto.imageCarLeft,
        imageCarRight: dto.imageCarRight,
        isChecked: dto.isChecked,
        driverJoinCampaignId: dto.driverJoinCampaignId,
        reporterId: reporterId.id,
      },
    });
    return 'Checked success';
  }
}
