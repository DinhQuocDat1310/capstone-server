import { PrismaService } from './../prisma/service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBrandByUserId(userId: string) {
    return await this.prisma.brand.findFirst({
      where: {
        userId: userId,
      },
    });
  }
}
