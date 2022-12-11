import { UpdateLocationDTO } from 'src/location/dto';
import { hash } from 'bcrypt';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Role, Status, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/service';
import { LocationCoordinate, CreateLocationDTO } from './dto';
import * as haversine from 'haversine-distance';
import * as moment from 'moment';
import { GLOBAL_DATE } from 'src/constants/cache-code';
import { Cache } from 'cache-manager';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async getListLocation(userRole: string) {
    return userRole === Role.BRAND
      ? await this.prisma.locationCampaignPerKm.findMany({
          where: {
            status: 'ENABLE',
          },
          orderBy: {
            locationName: 'asc',
          },
        })
      : await this.prisma.locationCampaignPerKm.findMany({
          orderBy: {
            locationName: 'asc',
          },
        });
  }

  async createNewLocation(location: CreateLocationDTO) {
    const globalDate = await this.cacheManager.get(GLOBAL_DATE);
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
        addressPoint: location.addressCheckPoint,
        createDate: moment(globalDate, 'MM/DD/YYYY')
          .toDate()
          .toLocaleDateString('vn-VN'),
      },
      select: {
        id: true,
        locationName: true,
        status: true,
      },
    });
    const password: string = await hash('123456aA!', 10);
    const randomKeyEmail = Math.floor(Math.random() * 99999);
    const randomPhone =
      Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;
    await this.prisma.reporter.create({
      data: {
        user: {
          create: {
            email: `reporter${randomKeyEmail}@gmail.com`,
            password,
            role: Role.REPORTER,
            phoneNumber: `+84${randomPhone}`,
            fullname: `Reporter ${randomKeyEmail}`,
            status: UserStatus.VERIFIED,
            address: newLocation.locationName,
          },
        },
      },
    });
    return newLocation.status;
  }

  async updateLocation(location: UpdateLocationDTO) {
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
        addressPoint: location.addressCheckPoint,
      },
    });
  }

  async CalculateLatLongToMetersDistance(
    pointA: LocationCoordinate,
    pointB: LocationCoordinate,
  ) {
    console.log(pointA, pointB);
    return haversine(pointA, pointB);
  }
}
