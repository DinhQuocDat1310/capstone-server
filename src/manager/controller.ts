import { Controller } from '@nestjs/common';
import { ManagersService } from './service';

@Controller('test')
export class ManagerController {
  constructor(private readonly managerService: ManagersService) {}
}
