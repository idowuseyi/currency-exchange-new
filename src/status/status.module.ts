import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { CountryModule } from '../countries/country.module';

@Module({
  imports: [CountryModule],
  controllers: [StatusController],
})
export class StatusModule { }
