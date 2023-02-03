import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/service';
import { CheckpointDTO, RouteDTO } from './dto';

@Injectable()
export class CheckPointService {
  constructor(private readonly prisma: PrismaService) {}

  async createCheckPoint(data: CheckpointDTO) {
    return await this.prisma.checkpoint.create({
      data,
    });
  }

  async getAllCheckpoints() {
    const route = await this.prisma.checkpoint.findMany({
      include: {
        checkpointTime: {
          include: {
            route: true,
          },
        },
      },
    });
    return route.map((r) => {
      const checkpointTime = r.checkpointTime
        .sort(
          (c1, c2) =>
            Number(c1.deadline.split(':')[0]) -
            Number(c2.deadline.split(':')[0]),
        )
        .map((c, index) => {
          return {
            ...c,
            deadline:
              index === 0
                ? `7:00 - ${c.deadline}`
                : `${r.checkpointTime[index - 1].deadline} - ${c.deadline}`,
          };
        });
      return {
        ...r,
        checkpointTime,
      };
    });
  }

  async getAllRoutes() {
    return await this.prisma.route.findMany({
      include: {
        coordinates: {
          select: {
            points: true,
          },
        },
        checkpointTime: {
          select: {
            deadline: true,
            checkpoint: {
              select: {
                latitude: true,
                longitude: true,
                addressName: true,
              },
            },
          },
        },
      },
    });
  }
}
