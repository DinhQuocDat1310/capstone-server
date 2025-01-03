import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get('PORT') || 4000;
  }

  getConfig(key: string) {
    return this.configService.get(key);
  }
}
