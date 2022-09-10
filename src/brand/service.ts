import { UsersService } from './../user/service';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BrandDTO } from './dto';
import { UserSignIn } from 'src/auth/dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async updateBrandInformation(dto: BrandDTO, userReq: UserSignIn) {
    const user = await this.usersService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    if (!user) throw new ForbiddenException();
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
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
