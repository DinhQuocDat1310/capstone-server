import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Role, Status } from '@prisma/client';
import { PrismaService } from 'src/prisma/service';
import { LocationDTO } from './dto';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getListLocation(userRole: string) {
    return userRole === Role.BRAND
      ? await this.prisma.locationCampaignPerKm.findMany({
          where: {
            status: 'ENABLE',
          },
        })
      : await this.prisma.locationCampaignPerKm.findMany({});
  }

  async createNewLocation(location: LocationDTO) {
    const campaign = await this.prisma.locationCampaignPerKm.findFirst({
      where: {
        locationName: location.locationName,
      },
    });
    if (campaign) throw new BadRequestException('Location is already exist');
    const newLocation = await this.prisma.locationCampaignPerKm.create({
      data: {
        locationName: location.locationName,
        price: location.price,
        status: Status.ENABLE,
      },
    });
    return newLocation.status;
  }

  async updateLocation(location: LocationDTO) {
    const campaign = await this.prisma.locationCampaignPerKm.findFirst({
      where: {
        id: location.id,
      },
    });
    if (!campaign) throw new BadRequestException('The id is not exist!!!');
    await this.prisma.locationCampaignPerKm.update({
      where: {
        id: location.id,
      },
      data: {
        price: location.price,
        status: location.status,
      },
    });
  }
}
