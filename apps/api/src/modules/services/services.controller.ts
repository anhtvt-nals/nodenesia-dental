import { Controller, Get, Inject } from '@nestjs/common';
import { ServicesService } from './services.service.js';
@Controller('api/v1/public/services')
export class ServicesController { constructor(@Inject(ServicesService) private readonly services: ServicesService) {} @Get() listPublic() { return this.services.listPublic(); } }
