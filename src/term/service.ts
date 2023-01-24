import { TermDto } from './dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';

@Injectable()
export class TermService {
  constructor(private readonly prisma: PrismaService) {}

  async createTerm(dto: TermDto) {
    await this.prisma.policiesTerm.create({
      data: {
        type: 'TERM',
        question: dto.question,
        answer: dto.answer,
      },
    });
    return `Created`;
  }

  async viewListTermAdmin() {
    return await this.prisma.policiesTerm.findMany({
      where: {
        type: 'TERM',
      },
    });
  }

  async viewListTermUser() {
    return await this.prisma.policiesTerm.findMany({
      where: {
        type: 'TERM',
        isActive: true,
      },
    });
  }

  async enableTerm(id: string) {
    await this.checkIdTerm(id);
    await this.prisma.policiesTerm.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });
    return `Enable Term`;
  }

  async disableTerm(id: string) {
    await this.checkIdTerm(id);
    await this.prisma.policiesTerm.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
    return `Disable Term`;
  }

  async checkIdTerm(id: string) {
    const checkIdTerm = await this.prisma.policiesTerm.findFirst({
      where: { id },
    });
    if (!checkIdTerm) throw new BadRequestException('Not found termId');
  }
}
