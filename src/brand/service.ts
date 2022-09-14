import { UsersService } from './../user/service';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { BrandVerifyInformationDTO } from './dto';
import { UserSignIn } from 'src/auth/dto';
import { UserStatus } from '@prisma/client';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { convertPhoneNumberFormat } from 'src/utilities';
import { AppConfigService } from 'src/config/appConfigService';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly configService: AppConfigService,
  ) {}

  async updateBrandVerify(dto: BrandVerifyInformationDTO, userReq: UserSignIn) {
    const user = await this.usersService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    const latestVerifyStatus = user.brand.verify[0]?.status;
    if (latestVerifyStatus === 'NEW' || latestVerifyStatus === 'PENDING') {
      throw new BadRequestException(
        'Your account is on processing, we will reponse back in 1 to 3 working days',
      );
    }
    if (latestVerifyStatus === 'ACCEPT' || latestVerifyStatus === 'BANNED') {
      throw new BadRequestException(
        `Your account is already processed, please check your email or contact with ${this.configService.getConfig(
          'MAILER',
        )} for more information`,
      );
    }
    if (user.phoneNumber !== dto.phoneNumber) {
      await this.usersService.checkEmailOrPhoneNumberIsExist(
        '',
        dto.phoneNumber,
        'This phone number is already used',
      );
    }
    if (user.idCitizen !== dto.idCitizen) {
      await this.usersService.checkIdCardIsExist(dto.idCitizen);
    }
    if (user.brand.idLicenseBusiness !== dto.idLicense) {
      await this.usersService.checkIdLicenseIsExist(dto.idLicense);
    }

    try {
      if (!latestVerifyStatus || latestVerifyStatus === 'UPDATE') {
        await this.verifyAccountService.createNewRequestVerifyBrandAccount(
          user.brand.id,
        );
      }
      return await this.prisma.user.update({
        where: {
          id: userReq.id,
        },
        data: {
          idCitizen: dto.idCitizen,
          status: UserStatus.PENDING,
          imageCitizenBack: dto.imageCitizenBack,
          imageCitizenFront: dto.imageCitizenFront,
          phoneNumber: convertPhoneNumberFormat(dto.phoneNumber),
          address: dto.address,
          brand: {
            update: {
              ownerLicenseBusiness: dto.ownerLicenseBusiness,
              logo: dto.logo,
              idLicenseBusiness: dto.idLicense,
              typeBusiness: dto.typeBusiness,
              imageLicenseBusiness: dto.imageLicenseBusiness,
            },
          },
        },
        include: {
          brand: true,
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
