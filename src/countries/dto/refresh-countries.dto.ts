import { IsOptional } from 'class-validator';

export class RefreshCountriesDto {
  @IsOptional()
  force?: boolean;
}
