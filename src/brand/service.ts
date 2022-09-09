import { UsersService } from './../user/service';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UploadedFiles,
} from '@nestjs/common';
import {
  BrandDTO,
  FileImageUploaddedForBrand,
  FileImageUploadForBrand,
} from './dto';
import { CloudinaryService } from 'src/cloudinary/service';
import { UserSignIn } from 'src/auth/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async findBrandByUserId(userId: string) {
    return await this.prisma.brand.findFirst({
      where: {
        userId: userId,
      },
    });
  }

  async updateBrandInformation(
    brandBody: BrandDTO,
    userReq: UserSignIn,
    @UploadedFiles() files: FileImageUploadForBrand,
  ) {
    const user = await this.usersService.getUserBrandInfo(
      userReq.email,
      userReq.role,
    );
    if (!user) throw new ForbiddenException();
    if (user.phoneNumber !== brandBody.phoneNumber) {
      await this.usersService.checkEmailOrPhoneNumberIsExist(
        '',
        brandBody.phoneNumber,
        'This phone number is already exist',
      );
    }
    if (user.idCitizen !== brandBody.idCitizen) {
      await this.usersService.checkIdCardIsExist(brandBody.idCitizen);
    }
    if (user.brand.idLicenseBusiness !== brandBody.idLicense) {
      await this.usersService.checkIdLicenseIsExist(brandBody.idLicense);
    }
    const result: FileImageUploaddedForBrand =
      await this.cloudinaryService.uploadImages(files);

    try {
      await this.prisma.$transaction(
        async (prisma: Prisma.TransactionClient) => {
          await prisma.user.update({
            where: {
              id: userReq.id,
            },
            data: {
              idCitizen: brandBody.idCitizen,
              imageCitizenBack: result.imageCitizenBack,
              imageCitizenFront: result.imageCitizenFront,
              phoneNumber: brandBody.phoneNumber,
              address: brandBody.address,
              brand: {
                update: {
                  ownerLicenseBusiness: brandBody.ownerLicenseBusiness,
                  logo: result.logo,
                  imageLicenseBusiness: result.imageLicenseBusiness,
                },
              },
            },
          });
        },
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
