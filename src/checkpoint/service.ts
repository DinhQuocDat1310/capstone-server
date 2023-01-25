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
    return await this.prisma.checkpoint.findMany();
  }

  async getAllRoutes() {
    return await this.prisma.route.findMany();
  }
}
