import { wrap } from './db/wrap';
import { users } from './db/user';
import { faq, policies } from './db/policy';

import { campaignOpen, campaignRunning } from './db/campaign';

import { PrismaService } from '../src/prisma/service';
import { Logger } from '@nestjs/common';
import { location } from './db/location';

async function main() {
  const prisma = new PrismaService();
  const logger = new Logger();
  const data = await users();
  const locations = await location();
  const wraps = await wrap();
  try {
    for (const dto of data) {
      await prisma.user.create({
        data: dto,
      });
    }
    for (const dto of locations) {
      await prisma.locationCampaignPerKm.create({
        data: dto,
      });
    }
    for (const dto of wraps) {
      await prisma.wrap.create({
        data: dto,
      });
    }

    for (let i = 0; i < policies.length; i++) {
      await prisma.policies.create({
        data: {
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
    await campaignRunning();
    await campaignOpen();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
