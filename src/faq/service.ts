import { FAQDto } from './dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/service';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async createFAQ(dto: FAQDto) {
    await this.prisma.fAQs.create({
      data: {
        question: dto.question,
        answer: dto.answer,
      },
    });
    return `Created`;
  }

  async viewListFAQsAdmin() {
    return await this.prisma.fAQs.findMany({});
  }

  async viewListFAQsUser() {
    return await this.prisma.fAQs.findMany({
      where: {
        isActive: true,
      },
    });
  }

  async enableFaq(id: string) {
    await this.checkIdFaq(id);
    await this.prisma.fAQs.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });
    return `Enable Faq`;
  }

  async disableFaq(id: string) {
    await this.checkIdFaq(id);
    await this.prisma.fAQs.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
    return `Disable Faq`;
  }

  async checkIdFaq(id: string) {
    const checkIdFaq = await this.prisma.fAQs.findFirst({
      where: { id },
    });
    if (!checkIdFaq) throw new BadRequestException('Not found faqID');
  }
}
