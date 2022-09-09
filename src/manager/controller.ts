import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/guard/decorators';
import { RolesGuard } from 'src/guard/roles.guard';

@Controller('manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
@ApiTags('Manager')
export class ManagerController {}
