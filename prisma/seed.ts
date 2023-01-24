import { faq, policies, terms } from './db/policy';
import { users } from './db/user';
import { Logger } from '@nestjs/common';
import { PositionWrap } from '@prisma/client';
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
          price: 300000,
        },
        {
          positionWrap: PositionWrap.BOTH_SIDE,
          price: 600000,
        },
        {
          positionWrap: PositionWrap.RIGHT_SIDE,
          price: 300000,
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
          answer: terms[i].answer,
          question: terms[i].question,
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

    const brands = await prisma.brand.findMany({
      select: {
        userId: true,
      },
    });

    for (let i = 0; i < brands.length; i++) {
      await prisma.eWallet.create({
        data: {
          userId: brands[i].userId,
          updateDate: new Date(),
          totalBalance: 0,
        },
      });
    }
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
