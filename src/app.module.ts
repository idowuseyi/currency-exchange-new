import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountryModule } from './countries/country.module';
import { StatusModule } from './status/status.module';
import { ImageModule } from './image/image.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    HttpModule,
    CountryModule,
    StatusModule,
    ImageModule,
  ],
})
export class AppModule {}
