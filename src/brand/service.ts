import { AppConfigService } from 'src/config/appConfigService';
import { VerifyBrandService } from './../verify-brand/service';
import { UsersService } from './../user/service';
import { PrismaService } from './../prisma/service';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UploadedFiles,
  NotFoundException,
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
    if (!userFind) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not found account email',
      });
    }
    await this.usersService.checkPermissionUser(userFind.status);
    const userUsedUniqueData =
      await this.usersService.checkBrandAlreadyHaveUniqueData(email);

    if (userUsedUniqueData) {
      if (
        userUsedUniqueData.identityCard !== null ||
        userUsedUniqueData.brand.businessLicense !== null
      ) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message:
            'Your account already add verify data. We will response soon.',
        });
      }
    }

    const checkIdLicense = await this.usersService.checkIdLicense(
      brand.idLicense,
    );
    if (checkIdLicense) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your ID license is invalid',
      });
    }

    const checkNo = await this.usersService.checkIdCardNumber(
      brand.idCardNumber,
    );
    if (checkNo) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your No card number is invalid',
      });
    }

    const checkPhone = await this.usersService.findUserByPhone(
      brand.phoneNumber,
    );
    if (checkPhone) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Your phonenumber already used',
      });
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
      await this.verifyBrandService.assignBrandWithManager(brand.brand.id);
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
          message: 'Created success',
          responseData,
        };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
    const userFind = await this.usersService.findUserByEmail(email);
    if (!userFind) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not found account email',
      });
    }
    await this.usersService.checkPermissionUser(userFind.status);

    if (brand.idLicense) {
      const checkIdLicense = await this.usersService.checkIdLicense(
        brand.idLicense,
      );
      if (checkIdLicense) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Your ID license is invalid',
        });
      }
    }

    if (brand.idCardNumber) {
      const checkNo = await this.usersService.checkIdCardNumber(
        brand.idCardNumber,
      );
      if (checkNo) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Your No card number is invalid',
        });
      }
    }

    if (brand.phoneNumber) {
      const checkPhone = await this.usersService.findUserByPhone(
        brand.phoneNumber,
      );
      if (checkPhone) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Your phonenumber already used',
        });
      }
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
      await this.verifyBrandService.assignBrandWithManager(brand.brand.id);
      const brandAddData = await this.prisma.brand.update({
        where: {
          userId: user.id,
        },
        data: dataBrand,
      });
      if (brandAddData) {
        const responseData = await this.responseData(user.id);
        return {
          statusCode: HttpStatus.OK,
          message: 'Update success',
          responseData,
        };
      }
    } catch (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
