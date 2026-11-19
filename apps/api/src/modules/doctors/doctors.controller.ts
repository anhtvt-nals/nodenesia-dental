import { Controller, Get, Inject } from '@nestjs/common';
import { DoctorsService } from './doctors.service.js';
@Controller('api/v1/public/doctors')
export class DoctorsController {
  constructor(@Inject(DoctorsService) private readonly doctors: DoctorsService) {}
  @Get() listPublic() { return this.doctors.listPublic(); }
  @Get('time-offs') listPublicTimeOffs() { return this.doctors.listPublicTimeOffs(); }
}
