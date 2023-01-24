import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/service';
import { CheckpointDTO, RouteDTO } from './dto';

@Injectable()
export class CheckPointService {
  constructor(private readonly prisma: PrismaService) {}

  async createCheckPoint(dto: CheckpointDTO) {
    return await this.prisma.checkpoint.create({
      data: {
        ...dto,
      },
    });
  }

  async getAllCheckpoints() {
    return await this.prisma.checkpoint.findMany();
  }

  async createRoute(route: RouteDTO) {
    const { name, price, totalKilometer, checkpoints } = route;
    return await this.prisma.route.create({
      data: {
        name,
        price: +price,
        totalKilometer: +totalKilometer,
        checkpoints: {
          connect: checkpoints,
        },
      },
    });
  }

  async getAllRoutes() {
    return await this.prisma.route.findMany();
  }
}
