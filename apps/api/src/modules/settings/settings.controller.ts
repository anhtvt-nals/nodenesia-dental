import { Controller, Get, Inject } from '@nestjs/common';
import { SettingsService } from './settings.service.js';

@Controller('api/v1/public/settings')
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settings: SettingsService) {}
  @Get()
  getPublic() { return this.settings.getPublic(); }
}
