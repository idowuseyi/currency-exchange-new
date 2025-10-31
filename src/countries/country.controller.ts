import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Query,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from './country.entity';

@Controller('countries')
export class CountryController {
  constructor(private countryService: CountryService) {}

  @Post('refresh')
  @HttpCode(200)
  async refresh() {
    return this.countryService.refreshCountries();
  }

  @Get()
  async getAll(
    @Query('region') region?: string,
    @Query('currency') currency?: string,
    @Query('sort') sort?: string,
  ): Promise<Country[]> {
    if (sort && sort !== 'gdp_desc') {
      throw new BadRequestException({ error: 'Invalid sort parameter. Only gdp_desc is supported.' });
    }
    return this.countryService.getAll(region, currency, sort as 'gdp_desc');
  }

  @Get(':name')
  async getOne(@Param('name') name: string): Promise<Country> {
    return this.countryService.getByName(name);
  }

  @Delete(':name')
  @HttpCode(204)
  async delete(@Param('name') name: string): Promise<void> {
    return this.countryService.deleteByName(name);
  }
}
