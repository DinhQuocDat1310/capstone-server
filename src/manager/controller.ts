import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('manager')
@ApiTags('Manager')
export class ManagerController {}
