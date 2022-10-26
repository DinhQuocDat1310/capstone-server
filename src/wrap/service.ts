import { Role } from '@prisma/client';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { WrapDTO } from './dto';

@Injectable()
export class WrapService {
  private readonly logger = new Logger(WrapService.name);
  constructor(private readonly prisma: PrismaService) {}

  async updateWrap(dto: WrapDTO) {
    const wrapId = await this.prisma.wrap.findFirst({
      where: {
        id: dto.wrapId,
      },
    });
    if (!wrapId) throw new BadRequestException('WrapID is not found');
    return await this.prisma.wrap.update({
      where: {
        id: dto.wrapId,
      },
      data: {
        price: dto.price,
        status: dto.status,
      },
    });
  }

  async getListWrap(userRole: string) {
    return userRole === Role.ADMIN
      ? await this.prisma.wrap.findMany({})
      : await this.prisma.wrap.findMany({
          where: {
            status: 'ENABLE',
          },
        });
  }
}
