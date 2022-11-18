import { UsersService } from './../user/service';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { BrandVerifyInformationDTO, UpdateBrandLogoDto } from './dto';
import { UserSignIn } from 'src/auth/dto';
import { VerifyAccountsService } from 'src/verifyAccount/service';
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
      if (!latestVerifyStatus) {
        await this.verifyAccountService.createNewRequestVerifyBrandAccount(
          user.brand.id,
        );
      } else if (latestVerifyStatus === 'UPDATE') {
        await this.verifyAccountService.createPendingRequestVerifyBrandAccount(
          user.brand.id,
          user.brand.verify[0].managerId,
        );
      }
      await this.usersService.updateUserBrandInformation(userReq.id, dto);
      return 'updated';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async updateBrandLogo(logo: UpdateBrandLogoDto, userReq: UserSignIn) {
    const user = await this.usersService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    try {
      await this.usersService.updateLogoBrand(user.id, logo);
      return 'updated';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async createRequestVerifyOdo(userId: string, driverJoinCampaignId: string) {
    const driverJoinCampaign = await this.prisma.driverJoinCampaign.findFirst({
      where: {
        id: driverJoinCampaignId,
      },
    });
    if (!driverJoinCampaign)
      throw new BadRequestException(
        'Please try again, this driver is not join your campaign',
      );

    if (driverJoinCampaign.isRequiredOdo)
      throw new BadRequestException(
        'You are request capture odo driver already',
      );

    await this.prisma.driverJoinCampaign.update({
      where: {
        id: driverJoinCampaignId,
      },
      data: {
        isRequiredOdo: true,
      },
    });
  }
}
