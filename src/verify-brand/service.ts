import { MailerService } from '@nestjs-modules/mailer';
import { VerifyInfoDto } from './dto';
import { ManagerService } from './../manager/service';
import { PrismaService } from './../prisma/service';
import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { UsersService } from 'src/user/service';
import { AppConfigService } from 'src/config/appConfigService';

@Injectable()
export class VerifyBrandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly managerService: ManagerService,
    private readonly mailerService: MailerService,
    private readonly configService: AppConfigService,
  ) {}

  async findManagerHandleMin() {
    try {
      const resultFind = await this.managerService.getManagerId();
      const managerIdMapping = await this.managerService.mappingManagerId(
        resultFind.map((manager) => manager.id),
      );
      if (managerIdMapping.length !== 0) return managerIdMapping[0].id;
      const managersMin = await this.prisma.verifyBrand.groupBy({
        by: ['managerId'],
        where: {
          status: 'PENDING',
        },
        _count: {
          managerId: true,
        },
        orderBy: {
          _count: {
            managerId: 'asc',
          },
        },
        take: 1,
      });
      return managersMin[0].managerId;
    } catch (error) {}
  }

  async assignManager(brandId: string) {
    try {
      const managerId = await this.findManagerHandleMin();
      await this.prisma.verifyBrand.create({
        data: {
          manager: {
            connect: {
              id: managerId,
            },
          },
          brand: {
            connect: {
              id: brandId,
            },
          },
        },
      });
      //Add notification
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async acceptBrandByManager(verifyInfoDto: VerifyInfoDto) {
    try {
      const result = await this.prisma.verifyBrand.update({
        where: {
          id: verifyInfoDto.idVerify,
        },
        data: {
          status: 'ACCEPT',
          detail: verifyInfoDto.detail,
        },
      });
      if (result) {
        await this.acceptMailBrand(verifyInfoDto.email);
        return {
          statusCode: HttpStatus.ACCEPTED,
          message: 'Your account was accepted',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error accept',
      };
    }
  }

  async requestChangeBrandByManager(verifyInfoDto: VerifyInfoDto) {
    try {
      const result = await this.prisma.verifyBrand.update({
        where: {
          id: verifyInfoDto.idVerify,
        },
        data: {
          status: 'REQUEST_TO_CHANGE',
          detail: verifyInfoDto.detail,
        },
      });
      if (result) {
        await this.requestChangeMailBrand(verifyInfoDto.email);
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Your account was request change info',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error request to change',
      };
    }
  }

  async deniedBrandByManager(verifyInfoDto: VerifyInfoDto) {
    try {
      const result = await this.prisma.verifyBrand.update({
        where: {
          id: verifyInfoDto.idVerify,
        },
        data: {
          status: 'BANNED',
          detail: verifyInfoDto.detail,
        },
      });
      if (result) {
        await this.deniedMailBrand(verifyInfoDto.email);
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Your account was denied',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error denied',
      };
    }
  }

  async getBrandByEmail(receiverEmail: string) {
    const user = await this.userService.findUserByEmail(receiverEmail);
    return await this.prisma.verifyBrand.findFirst({
      where: {
        brand: {
          userId: user.id,
        },
      },
      select: {
        brand: {
          select: {
            brandName: true,
          },
        },
      },
    });
  }

  async acceptMailBrand(receiverEmail: string) {
    const data = await this.getBrandByEmail(receiverEmail);
    await this.mailerService.sendMail({
      to: receiverEmail,
      from: this.configService.getConfig('MAILER'),
      subject: 'Verified account Brandvertise',
      html: `
      <h1 style="color: green">Hello ${data.brand.brandName},</h1></br>
      <p>Thanks for becoming Brandvertise's partner!</p>
      <p>Join with us!. Your account was accepted.</p></br>
      <p>Regards,</p>
      <p style="color: green">Brandvertise</p>
      `,
    });
  }

  async deniedMailBrand(receiverEmail: string) {
    const data = await this.getBrandByEmail(receiverEmail);
    await this.mailerService.sendMail({
      to: receiverEmail,
      from: this.configService.getConfig('MAILER'),
      subject: 'Verified account Brandvertise',
      html: `
      <h1 style="color: green">Hello ${data.brand.brandName},</h1></br>
      <p>Thanks for becoming Brandvertise's partner!</p>
      <p>We're sorry about your violence informations register. Your account was denied.</p></br>
      <p>Is this have any problems?. Please contact: ${this.configService.getConfig(
        'MAILER',
      )} for more information.</p>
      <p>Regards,</p>
      <p style="color: green">Brandvertise</p>
      `,
    });
  }

  async requestChangeMailBrand(receiverEmail: string) {
    const data = await this.getBrandByEmail(receiverEmail);
    const linkUpdateData = `http://localhost:4000/brand/verify-information/${receiverEmail}`;
    await this.mailerService.sendMail({
      to: receiverEmail,
      from: this.configService.getConfig('MAILER'),
      subject: 'Verified account Brandvertise',
      html: `
      <h1 style="color: green">Hello ${data.brand.brandName},</h1></br>
      <p>Thanks for becoming Brandvertise's partner!</p>
      <p>Oops! Something is wrong. Your account have invalid some informations.</p></br>
      <p>Please update your verify information at <a href=${linkUpdateData}>Verify data link</a></p>
      <p>Regards,</p>
      <p style="color: green">Brandvertise</p>
      `,
    });
  }
}
