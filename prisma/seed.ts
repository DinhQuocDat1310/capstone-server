import { wrap } from './db/wrap';
import { users } from './db/user';
import { campaignRunning } from './db/campaign';

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

    await campaignRunning();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
