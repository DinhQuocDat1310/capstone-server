import { Controller } from '@nestjs/common';
import { ContractService } from './service';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}
}
