import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Country } from '../src/countries/country.entity';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Country Currency API (e2e)', () => {
  let app: INestApplication<App>;
  let countryRepo: Repository<Country>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    countryRepo = moduleFixture.get<Repository<Country>>(getRepositoryToken(Country));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await countryRepo.clear();
  });

  describe('GET /countries', () => {
    it('should return empty array when no countries', () => {
      return request(app.getHttpServer())
        .get('/countries')
        .expect(200)
        .expect([]);
    });
  });

  describe('GET /countries/:name', () => {
    it('should return 404 for non-existent country', () => {
      return request(app.getHttpServer())
        .get('/countries/nonexistent')
        .expect(404)
        .expect({
          error: 'Country not found',
        });
    });
  });

  describe('DELETE /countries/:name', () => {
    it('should return 404 for non-existent country', () => {
      return request(app.getHttpServer())
        .delete('/countries/nonexistent')
        .expect(404)
        .expect({
          error: 'Country not found',
        });
    });
  });

  describe('GET /status', () => {
    it('should return status with zero countries initially', () => {
      return request(app.getHttpServer())
        .get('/status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total_countries');
          expect(res.body).toHaveProperty('last_refreshed_at');
          expect(res.body.total_countries).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('GET /countries/image', () => {
    it('should return 404 when no image exists', () => {
      return request(app.getHttpServer())
        .get('/countries/image')
        .expect(404)
        .expect({
          error: 'Summary image not found',
        });
    });
  });

  // Integration tests that require external APIs - these will be skipped in actual test run
  // as they require real network calls and database
  describe('POST /countries/refresh', () => {
    it.skip('should refresh countries and return success response', () => {
      return request(app.getHttpServer())
        .post('/countries/refresh')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('refreshed_at');
          expect(typeof res.body.total).toBe('number');
          expect(typeof res.body.refreshed_at).toBe('string');
        });
    });
  });

  describe('Countries with filters and sorting', () => {
    beforeEach(async () => {
      // Insert test data
      const testCountries = [
        {
          name: 'Nigeria',
          capital: 'Abuja',
          region: 'Africa',
          population: 206139589,
          currency_code: 'NGN',
          exchange_rate: 1600.0,
          estimated_gdp: 100000000000,
          flag_url: 'https://example.com/ng.png',
          last_refreshed_at: new Date(),
        },
        {
          name: 'Ghana',
          capital: 'Accra',
          region: 'Africa',
          population: 31072940,
          currency_code: 'GHS',
          exchange_rate: 15.0,
          estimated_gdp: 5000000000,
          flag_url: 'https://example.com/gh.png',
          last_refreshed_at: new Date(),
        },
        {
          name: 'Japan',
          capital: 'Tokyo',
          region: 'Asia',
          population: 125800000,
          currency_code: 'JPY',
          exchange_rate: 150.0,
          estimated_gdp: 5000000000000,
          flag_url: 'https://example.com/jp.png',
          last_refreshed_at: new Date(),
        },
      ];

      await countryRepo.save(testCountries);
    });

    it('should return all countries', () => {
      return request(app.getHttpServer())
        .get('/countries')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(3);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('currency_code');
        });
    });

    it('should filter countries by region', () => {
      return request(app.getHttpServer())
        .get('/countries?region=Africa')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body.every(country => country.region === 'Africa')).toBe(true);
        });
    });

    it('should filter countries by currency', () => {
      return request(app.getHttpServer())
        .get('/countries?currency=NGN')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].currency_code).toBe('NGN');
        });
    });

    it('should sort countries by GDP descending', () => {
      return request(app.getHttpServer())
        .get('/countries?sort=gdp_desc')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const gdps = res.body.map(country => country.estimated_gdp).filter(gdp => gdp !== null);
          for (let i = 1; i < gdps.length; i++) {
            expect(gdps[i - 1]).toBeGreaterThanOrEqual(gdps[i]);
          }
        });
    });

    it('should return country by name (case insensitive)', () => {
      return request(app.getHttpServer())
        .get('/countries/nigeria')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Nigeria');
          expect(res.body.capital).toBe('Abuja');
        });
    });

    it('should return country by lowercase name', () => {
      return request(app.getHttpServer())
        .get('/countries/ghana')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Ghana');
        });
    });

    it('should delete country by name', async () => {
      await request(app.getHttpServer())
        .delete('/countries/Ghana')
        .expect(204);

      // Verify deletion
      return request(app.getHttpServer())
        .get('/countries/ghana')
        .expect(404);
    });
  });
});
