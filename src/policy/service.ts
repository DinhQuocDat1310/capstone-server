import { PolicyDto } from './dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';

@Injectable()
export class PolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async createPolicy(dto: PolicyDto) {
    await this.prisma.policiesTerm.create({
      data: {
        type: 'POLICY',
        question: dto.question,
        answer: dto.answer,
      },
    });
    return `Created`;
  }

  async viewListPolicyUser() {
    return await this.prisma.policiesTerm.findMany({
      where: {
        type: 'POLICY',
        isActive: true,
      },
    });
  }

  async viewListPolicyAdmin() {
    return await this.prisma.policiesTerm.findMany({
      where: {
        type: 'POLICY',
      },
    });
  }

  async enablePolicy(id: string) {
    await this.checkIdPolicy(id);
    await this.prisma.policiesTerm.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });
    return `Enable Policy`;
  }

  async disablePolicy(id: string) {
    await this.checkIdPolicy(id);
    await this.prisma.policiesTerm.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
    return `Disable Policy`;
  }

  async checkIdPolicy(id: string) {
    const checkIdPolicy = await this.prisma.policiesTerm.findFirst({
      where: { id },
    });
    if (!checkIdPolicy) throw new BadRequestException('Not found policyID');
  }
}
