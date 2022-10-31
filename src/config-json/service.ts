import { VariableConfig } from './dto';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ConfigJsonService {
  listDataConfig = () => {
    return JSON.parse(fs.readFileSync('./dataConfig.json', 'utf-8'));
  };

  saveJsonDataConfig = (dto: VariableConfig) => {
    const listDataDuration = this.listDataConfig().duration;
    const listDtoDuration = dto.duration;
    const uniqueListDtoDuration = Array.from(new Set(listDtoDuration));
    const duplicateDuration = listDataDuration.filter(
      (data: string) => uniqueListDtoDuration.indexOf(data) !== -1,
    );
    const newDuration = listDataDuration
      .filter((data: string) => !uniqueListDtoDuration.includes(data))
      .concat(
        uniqueListDtoDuration.filter(
          (data) => !listDataDuration.includes(data),
        ),
      );
    const data = {
      duration: [...duplicateDuration, ...newDuration],
      minimumKmDrive: dto.minimumKmDrive,
      gapOpenRegisterForm: dto.gapOpenRegisterForm,
      gapPaymentDeposit: dto.gapPaymentDeposit,
      gapWrapping: dto.gapWrapping,
    };
    return fs.writeFileSync('./dataConfig.json', JSON.stringify(data));
  };
}
