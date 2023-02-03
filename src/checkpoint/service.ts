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
    return await this.prisma.checkpoint.findMany({});
  }

  async getRoutesByCheckpoint(checkpointId: string) {
    const checkpoint = await this.prisma.checkpoint.findFirst({
      where: {
        id: checkpointId,
      },
      select: {
        checkpointTime: {
          select: {
            routeId: true,
          },
        },
      },
    });
    const checkpointUni = [...new Set(checkpoint.checkpointTime)];
    const routes = [];
    for (let i = 0; i < checkpointUni.length; i++) {
      const route = await this.prisma.route.findFirst({
        where: {
          id: checkpointUni[i].routeId,
        },
        include: {
          checkpointTime: {
            include: {
              checkpoint: {
                select: {
                  addressName: true,
                  reporter: {
                    select: {
                      user: {
                        select: {
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
      routes.push(route);
    }
    return routes;
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
