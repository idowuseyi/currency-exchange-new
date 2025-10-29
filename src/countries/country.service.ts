import {
  Injectable,
  ServiceUnavailableException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './country.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { randomInRange } from '../utils/random.util';
import { ImageService } from '../image/image.service';

interface RestCountry {
  name: string;
  capital?: string;
  region?: string;
  population: number;
  flag: string;
  currencies?: Array<{ code: string }>;
}

interface ExchangeRateResponse {
  rates: Record<string, number>;
  result: string;
}

@Injectable()
export class CountryService {
  private lastRefreshTimestamp: Date | null = null;

  constructor(
    @InjectRepository(Country)
    private countryRepo: Repository<Country>,
    private httpService: HttpService,
    private imageService: ImageService,
  ) {}

  async refreshCountries(): Promise<{ total: number; refreshed_at: string }> {
    let countriesData: RestCountry[];
    let exchangeRates: Record<string, number> = {};

    // 1. Fetch countries
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies',
        ),
      );
      countriesData = data;
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'External data source unavailable',
        details: 'Could not fetch data from restcountries.com',
      });
    }

    // 2. Fetch exchange rates
    try {
      const { data } = await firstValueFrom(
        this.httpService.get('https://open.er-api.com/v6/latest/USD'),
      );
      if (data.result !== 'success') throw new Error('Invalid response');
      exchangeRates = data.rates;
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'External data source unavailable',
        details: 'Could not fetch data from open.er-api.com',
      });
    }

    const now = new Date();
    const savedCountries: Country[] = [];

    for (const country of countriesData) {
      const currencyCode =
        country.currencies && country.currencies.length > 0
          ? country.currencies[0].code
          : null;

      let exchangeRate: number | null = null;
      let estimatedGdp: number | null = 0;

      if (currencyCode && exchangeRates[currencyCode]) {
        exchangeRate = exchangeRates[currencyCode];
        const multiplier = randomInRange(1000, 2000);
        estimatedGdp = (country.population * multiplier) / exchangeRate;
      } else if (!currencyCode) {
        estimatedGdp = 0;
      } else {
        estimatedGdp = null;
      }

      const existing = await this.countryRepo
        .createQueryBuilder('country')
        .where('LOWER(country.name) = LOWER(:name)', { name: country.name })
        .getOne();

      const countryEntity = existing
        ? existing
        : this.countryRepo.create();

      countryEntity.name = country.name;
      countryEntity.capital = country.capital || null;
      countryEntity.region = country.region || null;
      countryEntity.population = country.population;
      countryEntity.currency_code = currencyCode;
      countryEntity.exchange_rate = exchangeRate;
      countryEntity.estimated_gdp = estimatedGdp;
      countryEntity.flag_url = country.flag;
      countryEntity.last_refreshed_at = now;

      savedCountries.push(await this.countryRepo.save(countryEntity));
    }

    this.lastRefreshTimestamp = now;

    // Generate summary image
    await this.imageService.generateSummaryImage(
      savedCountries.length,
      now.toISOString(),
      savedCountries,
    );

    return {
      total: savedCountries.length,
      refreshed_at: now.toISOString(),
    };
  }

  async getAll(
    region?: string,
    currency?: string,
    sort?: 'gdp_desc',
  ): Promise<Country[]> {
    const qb = this.countryRepo.createQueryBuilder('country');

    if (region) {
      qb.andWhere('country.region = :region', { region });
    }
    if (currency) {
      qb.andWhere('country.currency_code = :currency', { currency });
    }
    if (sort === 'gdp_desc') {
      qb.orderBy('country.estimated_gdp', 'DESC', 'NULLS LAST');
    }

    return qb.getMany();
  }

  async getByName(name: string): Promise<Country> {
    const country = await this.countryRepo
      .createQueryBuilder('country')
      .where('LOWER(country.name) = LOWER(:name)', { name })
      .getOne();
    if (!country) {
      throw new NotFoundException({ error: 'Country not found' });
    }
    return country;
  }

  async deleteByName(name: string): Promise<void> {
    const country = await this.countryRepo
      .createQueryBuilder('country')
      .where('LOWER(country.name) = LOWER(:name)', { name })
      .getOne();

    if (!country) {
      throw new NotFoundException({ error: 'Country not found' });
    }

    await this.countryRepo.delete({ name: country.name });
  }

  async getStatus() {
    const count = await this.countryRepo.count();
    return {
      total_countries: count,
      last_refreshed_at: this.lastRefreshTimestamp?.toISOString() || null,
    };
  }
}
