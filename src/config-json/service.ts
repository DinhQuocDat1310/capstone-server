import { VariableConfig } from './dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ConfigJsonService {
  listDataConfig = () => {
    return JSON.parse(fs.readFileSync('./dataConfig.json', 'utf-8'));
  };

  saveJsonDataConfig = (dto: VariableConfig) => {
    const listDtoDuration = dto.duration;
    const inputDuration = listDtoDuration.some(
      (duration, index) => index !== listDtoDuration.indexOf(duration),
    );

    if (inputDuration)
      throw new BadRequestException('Duplicate duration input');
    const data = {
      duration: listDtoDuration,
      minimumKmDrive: dto.minimumKmDrive,
      gapOpenRegisterForm: dto.gapOpenRegisterForm,
      gapPaymentDeposit: dto.gapPaymentDeposit,
      gapWrapping: dto.gapWrapping,
    };
    return fs.writeFileSync('./dataConfig.json', JSON.stringify(data));
  };
}
