import { GoogleDistanceMatrixDto, ResponseGoogleMatrix } from './dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import * as distance from 'google-distance-matrix';
import { AppConfigService } from 'src/config/appConfigService';
import { RouteDTO } from 'src/checkpoint/dto';

@Injectable()
export class GoogleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
  ) {}
  async calcDistanceMatrix(
    dto: GoogleDistanceMatrixDto,
  ): Promise<ResponseGoogleMatrix> {
    distance.key(this.configService.getConfig('GOOGLE_API_KEY'));
    distance.units('imperial');
    distance.transit_routing_preference('fewer_transfers');

    const originsAddress = [dto.latitudeOri, dto.longitudeOri];
    const destinationAddress = [dto.latitudeDes, dto.longitudeDes];

    return distance.matrix(
      originsAddress,
      destinationAddress,
      function (err, distances: ResponseGoogleMatrix) {
        if (err) {
          throw new BadRequestException('Bad Request');
        }
        return distances;
      },
    );
  }

  async calculateRoute(route: RouteDTO) {
    // calculate distance
    let totalMeters: number;
    for (let i = 0; i < route.checkpoints.length; i++) {
      const j = i + 1;
      if (j === route.checkpoints.length) break;
      const origin = await this.prisma.checkpoint.findFirst({
        where: { id: route.checkpoints[i].id },
      });
      const destination = await this.prisma.checkpoint.findFirst({
        where: { id: route.checkpoints[j].id },
      });
      const checkPointIsExist =
        await this.prisma.googleDistanceMatrix.findFirst({
          where: {
            originCheckpointId: origin.id,
            destinationCheckpointId: destination.id,
          },
        });

      if (checkPointIsExist) {
        totalMeters = totalMeters + checkPointIsExist.distance;
      } else {
        const distanceMatrix = await this.calcDistanceMatrix({
          latitudeOri: origin.latitude,
          longitudeOri: origin.longitude,
          latitudeDes: destination.latitude,
          longitudeDes: destination.longitude,
        });
        const distance = distanceMatrix.rows[0].elements[0].distance.value;
        const time = distanceMatrix.rows[0].elements[0].duration.value;
        await this.prisma.googleDistanceMatrix.create({
          data: {
            distance,
            time,
            originCheckpoint: {
              connect: {
                id: origin.id,
              },
            },
            destinationCheckpoint: {
              connect: {
                id: destination.id,
              },
            },
          },
        });
        totalMeters += distance;
      }
    }

    // create Route based on data google map
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
        price: Math.ceil((totalMeters / 1000) * 15000),
        totalKilometer: Math.ceil(totalMeters / 1000),
        checkpointTime: {
          connect: [
            ...checkpointTimeList.map((c) => {
              return { id: c.id };
            }),
          ],
        },
      },
    });
  }
}
