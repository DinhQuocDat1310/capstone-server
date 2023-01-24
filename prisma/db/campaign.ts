import { StatusVerifyCampaign } from '@prisma/client';
import { PrismaService } from '../../src/prisma/service';
import { FAKE_LOGO } from './../../src/constants/fake-data';

export const campaignOpen = async (prisma: PrismaService) => {
  const manager = await prisma.manager.findFirst({
    where: {
      user: {
        fullname: 'Manager 1',
      },
    },
  });
  const brand = await prisma.brand.findFirst({
    where: {
      brandName: 'Brand 1',
    },
  });
  const wrap = await prisma.wrap.findFirst({});
  const route = await prisma.route.findFirst({});
  const campaign = await prisma.campaign.create({
    data: {
      statusCampaign: 'OPEN',
      campaignName: 'Campaign Open Prisma',
      description: 'Campaign is open from seeding prisma',
      poster: FAKE_LOGO[4],
      startRegisterDate: new Date(),
      endRegisterDate: addDays(new Date(), 4),
      startPaymentDate: addDays(new Date(), 5),
      endPaymentDate: addDays(new Date(), 9),
      startWrapDate: addDays(new Date(), 10),
      endWrapDate: addDays(new Date(), 13),
      startRunningDate: addDays(new Date(), 14),
      duration: 2,
      quantityDriver: 2,
      wrapPrice: wrap.price,
      brand: {
        connect: {
          id: brand.id,
        },
      },
      wrap: {
        connect: {
          id: wrap.id,
        },
      },
      route: {
        connect: {
          id: route.id,
        },
      },
    },
    include: {
      wrap: true,
      route: true,
    },
  });
  await prisma.verifyCampaign.create({
    data: {
      status: StatusVerifyCampaign.ACCEPT,
      createDate: new Date(),
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
  });

  const extraWrapMoney =
    campaign.wrap.positionWrap === 'BOTH_SIDE' ? 400000 : 200000;
  const priceWrap = campaign.wrapPrice;
  const time = Math.ceil(campaign.duration / 30) - 1;
  const totalWrapMoney =
    (priceWrap + time * extraWrapMoney) * campaign.quantityDriver;
  const totalDriverMoney =
    campaign.route.price * campaign.duration * campaign.quantityDriver;

  await prisma.contractCampaign.create({
    data: {
      contractName: 'Contract ' + campaign.id,
      campaign: {
        connect: {
          id: campaign.id,
        },
      },
      totalDriverMoney: totalDriverMoney,
      totalWrapMoney: totalWrapMoney,
      totalSystemMoney: totalDriverMoney * 0.1,
      isAccept: true,
    },
  });
};

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
