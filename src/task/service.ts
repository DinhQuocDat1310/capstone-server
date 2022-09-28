import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ManagerService } from 'src/manager/service';
import { VerifyAccountsService } from 'src/verifyAccount/service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private readonly verifyAccountService: VerifyAccountsService,
    private readonly managerService: ManagerService,
  ) {}

  @Cron('0 */4 * * * *')
  async handleAddManagerVerifyBrandData() {
    try {
      const HANDLE_REQUEST_IN_A_DAY = 5;
      const verifies = await this.verifyAccountService.getAllVerifyNew();
      const managers = await this.managerService.getManagers();
      if (verifies.length === 0) {
        this.logger.debug(
          `We don't have any request verify account to assign to manager `,
        );
        return;
      }
      if (verifies.length < managers.length) {
        this.logger.debug(
          'Too less request verify account to assign for manager',
        );
        return;
      }
      const ratio =
        verifies.length / (managers.length * HANDLE_REQUEST_IN_A_DAY);

      const requestsHandlerPerDay =
        ratio >= 1
          ? HANDLE_REQUEST_IN_A_DAY
          : Math.floor(verifies.length / managers.length);

      for (let i = 0; i < managers.length; i++) {
        const arr = verifies.splice(0, requestsHandlerPerDay);
        if (arr.length !== 0)
          await this.managerService.connectVerifyAccountsToManager(
            arr,
            managers[i].id,
          );
      }
      this.logger.debug(
        `Assign sucessful ${requestsHandlerPerDay} request verify account for each Manager`,
      );
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
