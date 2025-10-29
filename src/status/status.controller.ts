import { Controller, Get } from '@nestjs/common';
import { CountryService } from '../countries/country.service';

@Controller('status')
export class StatusController {
  constructor(private countryService: CountryService) {}

  @Get()
  async getStatus() {
    return this.countryService.getStatus();
  }
}
