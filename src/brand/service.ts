import { VerifyBrandService } from './../verify-brand/service';
import { UsersService } from './../user/service';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UploadedFiles,
} from '@nestjs/common';
import { VerifyDataDto } from './dto';
import { CloudinaryService } from 'src/cloudinary/service';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly verifyBrandService: VerifyBrandService,
  ) {}

  async findBrandByUserId(userId: string) {
    return await this.prisma.brand.findFirst({
      where: {
        userId: userId,
      },
    });
  }

  async checkIdLicenseAndIdCard(idLicense: string, no: string) {
    return await this.prisma.brand.findFirst({
      where: {
        OR: [
          {
            businessLicense: {
              idLicense,
            },
          },
          {
            user: {
              identityCard: {
                no,
              },
            },
          },
        ],
      },
    });
  }

  async addDataVerify(
    brand: VerifyDataDto,
    email: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const resultCheck = await this.checkIdLicenseAndIdCard(
      brand.idLicense,
      brand.idCardNumber,
    );
    if (resultCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your ID license or No.Card number is invalid',
      };
    }

    const checkUserExistedUniqueData =
      await this.usersService.checkUserUsingUniqueData(email);
    if (checkUserExistedUniqueData) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Account: ${email} already have ID license or No.Card number. Failed to add data.`,
      };
    }
    const result: any = await this.cloudinaryService.uploadImages(files);
    const {
      address,
      fullname,
      idCardNumber,
      idLicense,
      imageLicense = result[1], //Cloud
      logo = result[0], //Cloud
      phoneNumber,
      imageBack = result[3], //Cloud
      imageFront = result[2], //Cloud
      typeBusiness,
    } = brand;

    const identityCard = {
      create: {
        imageFront: imageFront.url,
        imageBack: imageBack.url,
        no: idCardNumber,
      },
    };

    const user = {
      update: {
        fullname,
        phoneNumber,
        identityCard,
      },
    };

    const businessLicense = {
      create: {
        imageLicense: imageLicense.url,
        typeBusiness,
        idLicense,
      },
    };

    const dataBrand = {
      logo: logo.url,
      address,
      user,
      businessLicense,
    };

    try {
      const user = await this.usersService.findUserByEmail(email);
      const brand = await this.usersService.findBrandByUserId(user.id);
      const brandAddData = await this.prisma.brand.update({
        where: {
          userId: user.id,
        },
        data: dataBrand,
      });
      await this.verifyBrandService.assignManager(brand.brand.id);
      if (brandAddData) {
        const responseData = await this.responseData(user.id);
        return {
          statusCode: HttpStatus.CREATED,
          message: 'Success',
          responseData,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listVerifyBrand(brandId: string[]) {
    return await this.prisma.brand.findMany({
      where: {
        id: { in: brandId },
      },
      select: {
        address: true,
        brandName: true,
        logo: true,
        user: {
          select: {
            fullname: true,
            phoneNumber: true,
            identityCard: {
              select: {
                no: true,
                imageFront: true,
                imageBack: true,
              },
            },
          },
        },
        businessLicense: {
          select: {
            typeBusiness: true,
            idLicense: true,
            imageLicense: true,
          },
        },
        verifyBrand: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async viewListVerifyByManager(email: string) {
    const user = await this.usersService.findUserByEmail(email);
    const availableBrand = await this.prisma.verifyBrand.findMany({
      where: {
        AND: [
          {
            manager: {
              user: {
                id: user.id,
              },
            },
          },
          { status: 'PENDING' },
        ],
      },
      select: {
        brandId: true,
      },
    });
    return await this.listVerifyBrand(
      availableBrand.map((brand) => brand.brandId),
    );
  }

  async responseData(userId: string) {
    return await this.prisma.brand.findFirst({
      where: {
        userId: userId,
      },
      select: {
        address: true,
        brandName: true,
        logo: true,
        user: {
          select: {
            email: true,
            fullname: true,
            phoneNumber: true,
            identityCard: {
              select: {
                no: true,
                imageFront: true,
                imageBack: true,
              },
            },
          },
        },
        businessLicense: {
          select: {
            typeBusiness: true,
            idLicense: true,
            imageLicense: true,
          },
        },
        verifyBrand: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}
