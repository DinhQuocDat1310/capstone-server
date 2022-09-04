import { AppConfigService } from 'src/config/appConfigService';
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
    private readonly appConfigService: AppConfigService,
  ) {}

  async findBrandByUserId(userId: string) {
    return await this.prisma.brand.findFirst({
      where: {
        userId: userId,
      },
    });
  }

  async addDataVerify(
    brand: VerifyDataDto,
    email: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const userFind = await this.usersService.findUserByEmail(email);
    if (userFind.status !== 'NEW') {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Cannot Request to Add data for this account. Please contact: ${this.appConfigService.getConfig(
          'MAILER',
        )} for more information.`,
      };
    }
    const userUsedUniqueData =
      await this.usersService.checkBrandAlreadyHaveUniqueData(email);

    if (userUsedUniqueData) {
      if (
        userUsedUniqueData.identityCard !== null ||
        userUsedUniqueData.brand.businessLicense !== null
      ) {
        return {
          statusCode: HttpStatus.CONFLICT,
          message:
            'Your account already add ID license or No.card number. Please update your data if your data was wrong.',
        };
      }
    }
    const resultCheck = await this.usersService.checkIdLicenseAndIdCard(
      brand.idLicense,
      brand.idCardNumber,
    );
    if (resultCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your ID license or No.Card number is invalid',
      };
    }
    const userFound = await this.usersService.findUserByPhone(
      brand.phoneNumber,
    );
    if (userFound) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your phonenumber already used',
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
      const brand = await this.usersService.findBrandByUserId(userFind.id);
      await this.verifyBrandService.assignManager(brand.brand.id);
      const brandAddData = await this.prisma.brand.update({
        where: {
          userId: userFind.id,
        },
        data: dataBrand,
      });
      if (brandAddData) {
        const responseData = await this.responseData(userFind.id);
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
            status: true,
          },
        },
      },
    });
  }

  async updateVerifyData(
    brand: VerifyDataDto,
    email: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const resultCheck = await this.usersService.checkIdLicenseAndIdCard(
      brand.idLicense,
      brand.idCardNumber,
    );

    if (resultCheck) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your ID license or No.Card number is invalid',
      };
    }
    const userFound = await this.usersService.findUserByPhone(
      brand.phoneNumber,
    );
    console.log(userFound);

    if (userFound) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your phonenumber already used',
      };
    }
    const result: any = await this.cloudinaryService.uploadImages(files);
    const logo =
      result.length !== 0 && files[0] !== undefined ? result[0].url : undefined;
    const imageLicense =
      result.length !== 0 && files[1] !== undefined ? result[1].url : undefined;
    const imageFront =
      result.length !== 0 && files[2] !== undefined ? result[2].url : undefined;
    const imageBack =
      result.length !== 0 && files[3] !== undefined ? result[3].url : undefined;
    const {
      address,
      fullname,
      idCardNumber,
      idLicense,
      phoneNumber,
      typeBusiness,
    } = brand;

    const identityCard = {
      update: {
        imageFront,
        imageBack,
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
      update: {
        imageLicense,
        typeBusiness,
        idLicense,
      },
    };

    const dataBrand = {
      logo,
      address,
      user,
      businessLicense,
    };

    try {
      const user = await this.usersService.findUserByEmail(email);
      const brand = await this.usersService.findBrandByUserId(user.id);
      await this.verifyBrandService.assignManager(brand.brand.id);
      const brandAddData = await this.prisma.brand.update({
        where: {
          userId: user.id,
        },
        data: dataBrand,
      });

      if (brandAddData) {
        const responseData = await this.responseData(user.id);
        return {
          statusCode: HttpStatus.ACCEPTED,
          message: 'Update success',
          responseData,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
