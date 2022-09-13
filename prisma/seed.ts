import { users } from './db/user';
import { PrismaService } from '../src/prisma/service';
import { Logger } from '@nestjs/common';
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
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
