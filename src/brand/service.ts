import { UsersService } from './../user/service';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BrandVerifyInformationDTO } from './dto';
import { UserSignIn } from 'src/auth/dto';
import { UserStatus } from '@prisma/client';
import { VerifyAccountsService } from 'src/verifyAccount/service';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly verifyAccountService: VerifyAccountsService,
  ) {}

  async updateBrandVerify(dto: BrandVerifyInformationDTO, userReq: UserSignIn) {
    const user = await this.usersService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    if (!user) throw new ForbiddenException();
    const latestVerifyStatus = user.brand?.verify[0]?.status;
    if (latestVerifyStatus === 'NEW' || latestVerifyStatus === 'PENDING') {
      throw new BadRequestException(
        'Your account is on processing, we will reponse back in 3 - 5',
      );
    }
    if (latestVerifyStatus === 'ACCEPT' || latestVerifyStatus === 'BANNED') {
      throw new ForbiddenException();
    }
    if (user.phoneNumber !== dto.phoneNumber) {
      await this.usersService.checkEmailOrPhoneNumberIsExist(
        '',
        dto.phoneNumber,
        'This phone number is already exist',
      );
    }
    if (user.idCitizen !== dto.idCitizen) {
      await this.usersService.checkIdCardIsExist(dto.idCitizen);
    }
    if (user.brand.idLicenseBusiness !== dto.idLicense) {
      await this.usersService.checkIdLicenseIsExist(dto.idLicense);
    }

    try {
      await this.prisma.user.update({
        where: {
          id: userReq.id,
        },
        data: {
          idCitizen: dto.idCitizen,
          status: UserStatus.PENDING,
          imageCitizenBack: dto.imageCitizenBack,
          imageCitizenFront: dto.imageCitizenFront,
          phoneNumber: dto.phoneNumber,
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
      });
      if (!latestVerifyStatus || latestVerifyStatus === 'UPDATE') {
        await this.verifyAccountService.createNewRequestVerifyBrandAccount(
          user,
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
