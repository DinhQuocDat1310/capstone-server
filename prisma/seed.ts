import { faq, policies, terms } from './db/policy';
import { users } from './db/user';
// import { campaignOpen, campaignRunning } from './db/campaign';
import { campaignOpen } from './db/campaign';
import { Logger } from '@nestjs/common';
import { PositionWrap, Status } from '@prisma/client';
import * as moment from 'moment';
import { PrismaService } from '../src/prisma/service';

async function main() {
  const prisma = new PrismaService();
  const logger = new Logger();
  const data = await users();

  try {
    for (const dto of data) {
      await prisma.user.create({
        data: dto,
      });
    }
    await prisma.wrap.createMany({
      data: [
        {
          positionWrap: PositionWrap.LEFT_SIDE,
          price: '300000',
          status: Status.ENABLE,
        },
        {
          positionWrap: PositionWrap.BOTH_SIDE,
          price: '600000',
          status: Status.ENABLE,
        },
        {
          positionWrap: PositionWrap.RIGHT_SIDE,
          price: '300000',
          status: Status.ENABLE,
        },
      ],
    });

    await prisma.locationCampaignPerKm.createMany({
      data: [
        {
          locationName: 'TP Hồ Chí Minh',
          price: '15000',
          status: Status.ENABLE,
          addressPoint:
            '37 Đ. Vạn Tượng, Phường 13, Quận 5, Thành phố Hồ Chí Minh, Vietnam',
          createDate: moment().toDate().toLocaleDateString('vn-VN'),
        },
        {
          locationName: 'Hà Nội',
          price: '15000',
          status: Status.ENABLE,
          addressPoint:
            '9 P. Trịnh Hoài Đức, Cát Linh, Đống Đa, Hà Nội, Vietnam',
          createDate: moment().toDate().toLocaleDateString('vn-VN'),
        },
      ],
    });

    for (let i = 0; i < policies.length; i++) {
      await prisma.policiesTerm.create({
        data: {
          type: 'POLICY',
          answer: policies[i].answer,
          question: policies[i].question,
        },
      });
    }

    for (let i = 0; i < terms.length; i++) {
      await prisma.policiesTerm.create({
        data: {
          type: 'TERM',
          answer: policies[i].answer,
          question: policies[i].question,
        },
      });
    }

    for (let i = 0; i < faq.length; i++) {
      await prisma.fAQs.create({
        data: {
          answer: faq[i].answer,
          question: faq[i].question,
        },
      });
    }
    // await campaignRunning(prisma);
    await campaignOpen(prisma);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
