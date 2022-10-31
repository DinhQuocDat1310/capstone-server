import { VariableConfig } from './dto';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ConfigJsonService {
  listDataConfig = () =>
    JSON.parse(fs.readFileSync('./dataConfig.json', 'utf-8'));

  saveJsonDataConfig = (dto: VariableConfig) =>
    fs.writeFileSync('./dataConfig.json', JSON.stringify(dto));
}
