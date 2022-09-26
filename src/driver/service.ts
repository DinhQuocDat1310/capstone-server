import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserSignIn } from 'src/auth/dto';
import { AppConfigService } from 'src/config/appConfigService';
import { UsersService } from 'src/user/service';
import { convertPhoneNumberFormat } from 'src/utilities';
import { VerifyAccountsService } from 'src/verifyAccount/service';
import { PrismaService } from './../prisma/service';
import { DriverVerifyInformationDTO } from './dto';

@Injectable()
export class DriversService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
  ) {}

  async updateDriverVerify(
    dto: DriverVerifyInformationDTO,
    userReq: UserSignIn,
  ) {
    const user = await this.usersService.getUserDriverInfo(
      convertPhoneNumberFormat(userReq.phoneNumber),
      userReq.role,
    );
    const latestVerifyStatus = user.driver.verify[0]?.status;
    if (latestVerifyStatus === 'NEW' || latestVerifyStatus === 'PENDING') {
      throw new BadRequestException(
        'Your account is on processing, we will reponse back in 1 to 3 working days',
      );
    }
    if (latestVerifyStatus === 'ACCEPT' || latestVerifyStatus === 'BANNED') {
      throw new BadRequestException(
        `Your account is already processed, please check your sms/phoneNumber or contact with ${this.configService.getConfig(
          'MAILER',
        )} for more information`,
      );
    }
    if (user.email !== dto.email) {
      await this.usersService.checkEmailOrPhoneNumberIsExist(
        dto.email,
        '',
        'This email is already used',
      );
    }
    if (user.idCitizen !== dto.idCitizen) {
      await this.usersService.checkIdIsExist({
        idCitizen: dto.idCitizen,
        message: 'This id card citizen is already used',
      });
    }

    if (user.driver.idCar !== dto.idCar) {
      await this.usersService.checkIdIsExist({
        idCar: dto.idCar,
        message: 'This idCar is already used',
      });
    }

    if (user.driver.bankAccountNumber !== dto.bankAccountNumber) {
      await this.usersService.checkIdIsExist({
        bankAccountNumber: dto.bankAccountNumber,
        message: 'This bank account number is already used',
      });
    }

    try {
      if (!latestVerifyStatus) {
        await this.verifyAccountService.createNewRequestVerifyDriverAccount(
          user.driver.id,
        );
      } else if (latestVerifyStatus === 'UPDATE') {
        await this.verifyAccountService.createPendingRequestVerifyDriverAccount(
          user.driver.id,
          user.driver.verify[0].managerId,
        );
      }

      await this.usersService.updateUserDriverInformation(userReq.id, dto);
      return 'updated';
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
