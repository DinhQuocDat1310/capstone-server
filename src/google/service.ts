import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { RouteDTO } from 'src/checkpoint/dto';
import { AppConfigService } from 'src/config/appConfigService';
import { PrismaService } from 'src/prisma/service';
import { ResponseMapBoxMatrix } from './dto';

@Injectable()
export class GoogleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
  ) {}
  async calcDistanceMatrix(checkpoints: string): Promise<ResponseMapBoxMatrix> {
    const key = this.configService.getConfig('MAP_BOX_ACCESS_TOKEN');
    const uri = 'https://api.mapbox.com/directions/v5/mapbox/driving';
    const config = {
      method: 'get',
      url: `${uri}/${checkpoints}?access_token=${key}`,
      headers: {},
    };
    const result = await axios(config);
    return result.data;
  }

  async calculateRoute(route: RouteDTO) {
    // calculate distance
    try {
      const checkpoints = [];
      for (let i = 0; i < route.checkpoints.length; i++) {
        const checkpoint = await this.prisma.checkpoint.findFirst({
          where: { id: route.checkpoints[i].id },
        });
        checkpoints.push(`${checkpoint.longitude},${checkpoint.latitude}`);
      }
      const result = await this.calcDistanceMatrix(checkpoints.join(';'));
      const distance = result.routes[0].distance;
      const routeInitialize = await this.prisma.route.create({
        data: {
          name: route.name,
          price: 0,
          totalKilometer: 0,
        },
      });
      const checkpointTimeDTO = route.checkpoints.map((c) => {
        return {
          routeId: routeInitialize.id,
          checkpointId: c.id,
          deadline: c.time,
        };
      });

      await this.prisma.checkpointTime.createMany({
        data: [...checkpointTimeDTO],
      });
      const checkpointTimeList = await this.prisma.checkpointTime.findMany({
        where: {
          routeId: routeInitialize.id,
        },
      });
      return await this.prisma.route.update({
        where: {
          id: routeInitialize.id,
        },
        data: {
          price: Math.ceil((distance / 1000) * 15000),
          totalKilometer: Math.ceil(distance / 1000),
          checkpointTime: {
            connect: [
              ...checkpointTimeList.map((c) => {
                return { id: c.id };
              }),
            ],
          },
        },
      });
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
