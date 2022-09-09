import { PrismaService } from './../prisma/service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagerService {
  constructor(private readonly prisma: PrismaService) {}
}
