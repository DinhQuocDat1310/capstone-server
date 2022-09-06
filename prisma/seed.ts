import { users } from './db/user';
import { Role } from '@prisma/client';
import { PrismaService } from '../src/prisma/service';
import { Logger } from '@nestjs/common';
async function main() {
  const prisma = new PrismaService();
  const logger = new Logger();
  try {
    for (const dto of await users()) {
      const { brandName, role, ...user } = dto;
      const data = {
        ...user,
        role,
      };
      data[role.toLowerCase()] = {
        create:
          role === Role.BRAND
            ? {
                brandName,
              }
            : {},
      };
      await prisma.user.create({
        data: { ...data, status: 'NEW' },
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
