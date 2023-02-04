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
      url: `${uri}/${checkpoints}?steps=true&geometries=geojson&access_token=${key}`,
      headers: {},
    };
    const result = await axios(config);
    return result.data;
  }

  async calculateRoute(route: RouteDTO) {
    // calculate distance

    try {
      if (route.checkpoints.length < 1)
        throw new BadRequestException(
          'Please check your route, route must be larger than 2 checkpoint',
        );

      for (let i = 0; i < route.checkpoints.length; i++) {
        if (i === 0) {
          if (Number(route.checkpoints[i].time.split(':')[0]) < 7) {
            throw new BadRequestException(
              'Please check your time on checkpoint, time start at 7:00',
            );
          }
          continue;
        }
        const first = Number(route.checkpoints[i - 1].time.split(':')[0]);
        const second = Number(route.checkpoints[i].time.split(':')[0]);

        if (second <= first)
          throw new BadRequestException('Please check your time on checkpoint');
      }

      const routeExist = await this.prisma.route.findMany({
        include: {
          checkpointTime: true,
        },
      });

      let isDuplicate = true;

      for (let i = 0; i < routeExist.length; i++) {
        const checkpointTime = routeExist[i].checkpointTime;
        if (checkpointTime.length !== route.checkpoints.length) {
          continue;
        }
        for (let j = 0; j < checkpointTime.length; j++) {
          if (checkpointTime[j].deadline !== route.checkpoints[j].time) {
            isDuplicate = false;
          }
        }
        if (isDuplicate) {
          throw new BadRequestException(
            'This route is already created, please check route again!',
          );
        } else {
          isDuplicate = true;
        }
      }

      const checkpoints = [];
      for (let i = 0; i < route.checkpoints.length; i++) {
        const checkpoint = await this.prisma.checkpoint.findFirst({
          where: { id: route.checkpoints[i].id },
        });
        checkpoints.push(`${checkpoint.longitude},${checkpoint.latitude}`);
      }
      const result = await this.calcDistanceMatrix(checkpoints.join(';'));
      if (!result) throw new Error('Cannot get routes');
      const coordinates = result.routes[0].geometry.coordinates;
      const distance = result.routes[0].distance;

      const routeInitialize = await this.prisma.route.create({
        data: {
          name: route.name,
          price: 0,
          totalKilometer: 0,
        },
      });

      for (let i = 0; i < coordinates.length; i++) {
        await this.prisma.coordinates.create({
          data: {
            routeId: routeInitialize.id,
            points: coordinates[i],
          },
        });
      }

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
      const coordinatesList = await this.prisma.coordinates.findMany({
        where: {
          routeId: routeInitialize.id,
        },
      });
      return await this.prisma.route.update({
        where: {
          id: routeInitialize.id,
        },
        data: {
          price: Math.ceil(distance / 1000) * 15000,
          totalKilometer: Math.ceil(distance / 1000),
          coordinates: {
            connect: [
              ...coordinatesList.map((c) => {
                return { id: c.id };
              }),
            ],
          },
          checkpointTime: {
            connect: [
              ...checkpointTimeList.map((c) => {
                return { id: c.id };
              }),
            ],
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
