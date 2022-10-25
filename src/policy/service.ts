import { PolicyDto } from './dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';

@Injectable()
export class PolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async createPolicy(dto: PolicyDto) {
    await this.prisma.policies.create({
      data: {
        question: dto.question,
        answer: dto.answer,
      },
    });
    return `Created`;
  }

  async viewListPolicy() {
    return await this.prisma.policies.findMany({});
  }

  async enablePolicy(id: string) {
    await this.checkIdPolicy(id);
    await this.prisma.policies.update({
      where: {
        id,
      },
      data: {
        status: 'ENABLE',
      },
    });
    return `Enable Policy`;
  }

  async disablePolicy(id: string) {
    await this.checkIdPolicy(id);
    await this.prisma.policies.update({
      where: {
        id,
      },
      data: {
        status: 'DISABLE',
      },
    });
    return `Disable Policy`;
  }

  async checkIdPolicy(id: string) {
    const checkIdPolicy = await this.prisma.policies.findFirst({
      where: { id },
    });
    if (!checkIdPolicy) throw new BadRequestException('Not found policyID');
  }
}
