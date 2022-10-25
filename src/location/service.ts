import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';
import { LocationDTO } from './dto';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getListLocation() {
    return await this.prisma.locationCampaignPerKm.findMany();
  }

  async createNewLocation(location: LocationDTO) {
    const campaign = await this.prisma.locationCampaignPerKm.findFirst({
      where: {
        locationName: location.locationName,
      },
    });
    if (campaign) throw new BadRequestException('Campaign is already exist');
    await this.prisma.locationCampaignPerKm.create({
      data: {
        locationName: location.locationName,
        price: location.price,
      },
    });
  }

  async updateLocation(location: LocationDTO) {
    const campaign = await this.prisma.locationCampaignPerKm.findFirst({
      where: {
        locationName: location.locationName,
      },
    });
    if (campaign) throw new BadRequestException('Campaign is already exist');
    await this.prisma.locationCampaignPerKm.create({
      data: {
        locationName: location.locationName,
        price: location.price,
      },
    });
  }
}
