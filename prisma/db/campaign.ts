import { CampaignVerifyInformationDTO } from 'src/campaign/dto';
import { PrismaService } from '../../src/prisma/service';
import { FAKE_IMAGE_CAR, FAKE_LOGO } from './../../src/constants/fake-data';
import * as moment from 'moment';
import { VerifyCampaignStatus } from '@prisma/client';

export const campaignRunning = async () => {
  const prisma = new PrismaService();
  const brand = await prisma.brand.findFirst({
    where: {
      brandName: 'Brand 1',
    },
  });
  const wrap = await prisma.wrap.findFirst({});
  const location = await prisma.locationCampaignPerKm.findFirst({
    where: {
      locationName: 'TP Hồ Chí Minh',
    },
  });

  const dtoCampaign: CampaignVerifyInformationDTO = {
    idLocation: location.id,
    idWrap: wrap.id,
    priceLocation: location.price,
    priceWrap: wrap.price,
    campaignName: 'Campaign Running Prisma',
    startRunningDate: moment(new Date()).subtract(4, 'days').toISOString(),
    duration: '30',
    totalKm: '15000',
    quantityDriver: `50`,
    description: 'Campaign is running from seeding prisma',
    minimumKmDrive: '10',
    poster: FAKE_LOGO[5],
  };
  const campaign = await prisma.campaign.create({
    data: {
      statusCampaign: 'RUNNING',
      campaignName: dtoCampaign.campaignName,
      startRunningDate: dtoCampaign.startRunningDate,
      quantityDriver: dtoCampaign.quantityDriver,
      totalKm: dtoCampaign.totalKm,
      description: dtoCampaign.description,
      poster: dtoCampaign.poster,
      minimumKmDrive: dtoCampaign.minimumKmDrive,
      locationPricePerKm: dtoCampaign.priceLocation,
      wrapPrice: dtoCampaign.priceWrap,
      duration: dtoCampaign.duration,
      startRegisterDate: moment(new Date()).subtract(22, 'days').toISOString(),
      endRegisterDate: moment(new Date()).subtract(17, 'days').toISOString(),
      startWrapDate: moment(new Date()).subtract(10, 'days').toISOString(),
      endWrapDate: moment(new Date()).subtract(5, 'days').toISOString(),
      brand: {
        connect: {
          userId: brand.userId,
        },
      },
      locationCampaign: {
        connect: {
          id: dtoCampaign.idLocation,
        },
      },
      wrap: {
        connect: {
          id: dtoCampaign.idWrap,
        },
      },
    },
    include: {
      locationCampaign: true,
    },
  });
  const drivers = await prisma.driver.findMany({
    where: {
      user: {
        address: campaign.locationCampaign.locationName,
      },
    },
    take: 50,
  });

  for (let i = 0; i < drivers.length; i++) {
    await prisma.driverJoinCampaign.create({
      data: {
        isRequiredOdo: false,
        campaign: {
          connect: {
            id: campaign.id,
          },
        },
        driver: {
          connect: {
            id: drivers[i].id,
          },
        },
        status: 'APPROVE',
      },
    });
  }
  const manager = await prisma.manager.findFirst({
    where: {
      user: {
        fullname: 'Manager 1',
      },
    },
  });
  const reporter = await prisma.reporter.findFirst({
    where: {
      user: {
        address: campaign.locationCampaign.locationName,
      },
    },
  });
  const verifyCampaign = await prisma.verifyCampaign.create({
    data: {
      status: VerifyCampaignStatus.ACCEPT,
      campaign: {
        connect: {
          id: campaign.id,
        },
      },
      manager: {
        connect: {
          id: manager.id,
        },
      },
    },
    include: {
      campaign: {
        include: {
          wrap: true,
        },
      },
    },
  });
  const isBothSide = verifyCampaign.campaign.wrap.positionWrap === 'BOTH_SIDE';
  const extraWrapMoney = isBothSide ? 400000 : 200000;
  const priceWrap = parseFloat(verifyCampaign.campaign.wrapPrice);
  const numDriver = parseInt(verifyCampaign.campaign.quantityDriver);
  const time = parseInt(verifyCampaign.campaign.duration) / 30 - 1;
  const totalWrapMoney = (priceWrap + time * extraWrapMoney) * numDriver;

  const totalDriverMoney =
    parseFloat(verifyCampaign.campaign.minimumKmDrive) *
    parseFloat(verifyCampaign.campaign.locationPricePerKm) *
    parseFloat(verifyCampaign.campaign.quantityDriver) *
    parseFloat(verifyCampaign.campaign.duration);

  const totalMoney = totalDriverMoney + totalWrapMoney;
  const totalDeposit = totalMoney * 0.2;
  const totalSystemMoney = totalDriverMoney * 0.1;

  await prisma.contractCampaign.create({
    data: {
      contractName: 'Contract ' + verifyCampaign.campaignId,
      campaign: {
        connect: {
          id: verifyCampaign.campaignId,
        },
      },
      totalDriverMoney: totalDriverMoney.toString(),
      totalWrapMoney: totalWrapMoney.toString(),
      totalSystemMoney: totalSystemMoney.toString(),
      isAccept: false,
    },
  });
  await prisma.paymentDebit.create({
    data: {
      campaign: {
        connect: {
          id: verifyCampaign.campaignId,
        },
      },
      type: 'PREPAY',
      createDate: moment(new Date()).subtract(11, 'days').toISOString(),
      expiredDate: moment(new Date()).subtract(16, 'days').toISOString(),
      price: totalDeposit.toString(),
      paidDate: moment(new Date()).subtract(14, 'days').toISOString(),
    },
  });
  const driverJoinCampaign = await prisma.driverJoinCampaign.findMany({
    where: { campaignId: campaign.id, status: 'APPROVE' },
    take: 50,
  });
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < driverJoinCampaign.length; j++) {
      await prisma.reporterDriverCampaign.create({
        data: {
          createDate: moment(campaign.startRunningDate)
            .add(i, 'days')
            .toISOString(),
          imageCarBack: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarLeft: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarRight: FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)],
          imageCarOdo:
            i === 0
              ? FAKE_IMAGE_CAR[Math.floor(Math.random() * 20)]
              : undefined,
          isChecked: true,
          driverJoinCampaignId: driverJoinCampaign[j].id,
          reporterId: reporter.id,
        },
      });
      const driverTracking = await prisma.driverTrackingLocation.create({
        data: {
          createDate: moment(campaign.startRunningDate)
            .add(i, 'days')
            .toISOString(),
          driverJoinCampaign: {
            connect: {
              id: driverJoinCampaign[j].id,
            },
          },
        },
      });
      await prisma.tracking.create({
        data: {
          timeSubmit: driverTracking.createDate,
          totalMeterDriven: `${
            Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000
          }`,
          driverTrackingLocation: {
            connect: {
              id: driverTracking.id,
            },
          },
        },
      });
    }
  }
};
