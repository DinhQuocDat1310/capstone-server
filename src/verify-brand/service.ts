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
          OR: [
            {
              status: 'PENDING',
            },
            {
              status: 'REQUEST_TO_CHANGE',
            },
          ],
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
      throw new BadRequestException({
        message:
          'Not found any manager to verify your data. Please add another Manager.',
      });
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
          statusVerify: 'ACCEPT',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error accept',
      };
    }
  }

  async viewListError(idVerify: string) {
    return this.prisma.verifyBrand.findFirst({
      where: {
        id: idVerify,
      },
      select: {
        detail: true,
      },
    });
  }

  async addErrorDetail(verifyInfoDto: VerifyInfoDto) {
    const { fieldError, messageError, idVerify } = verifyInfoDto;
    const detail = messageError.reduce((result, field, index) => {
      result[fieldError[index]] = field;
      return result;
    }, {});
    const result = await this.prisma.verifyBrand.update({
      where: {
        id: idVerify,
      },
      data: {
        detail,
      },
    });
    return result.detail;
  }

  async requestChangeBrandByManager(verifyInfoDto: VerifyInfoDto) {
    try {
      let messageDetail = '';
      const { email, idVerify } = verifyInfoDto;
      const detailResponse = await this.addErrorDetail(verifyInfoDto);
      for (const [key, value] of Object.entries(detailResponse)) {
        messageDetail += `${key} is ${value}, `;
      }
      if (detailResponse) {
        const result = await this.prisma.verifyBrand.update({
          where: {
            id: idVerify,
          },
          data: {
            status: 'REQUEST_TO_CHANGE',
          },
        });
        if (result) {
          await this.requestChangeMailBrand(email, messageDetail);
          return {
            statusCode: HttpStatus.ACCEPTED,
            message: 'Your account was request change info',
            statusVerify: 'REQUEST_TO_CHANGE',
            details: {
              statusCode: HttpStatus.ACCEPTED,
              detailResponse,
            },
          };
        }
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
          message: 'Your account was banned',
          statusVerify: 'BANNED',
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

  async requestChangeMailBrand(receiverEmail: string, detail: string) {
    const data = await this.getBrandByEmail(receiverEmail);
    const linkUpdateData = `http://localhost:4000/brand/verify-information/${receiverEmail}`;
    await this.mailerService.sendMail({
      to: receiverEmail,
      from: this.configService.getConfig('MAILER'),
      subject: 'Verified account Brandvertise',
      html: `
      <h1 style="color: green">Hello ${data.brand.brandName},</h1></br>
      <p>Thanks for becoming Brandvertise's partner!</p>
      <p>Oops! Something is wrong. Your account have invalid some informations: <b>${detail}</b></p></br>
      <p>Please update your verify information at <a href=${linkUpdateData}>Verify data link</a></p>
      <p>Regards,</p>
      <p style="color: green">Brandvertise</p>
      `,
    });
  }
}
