import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('countries')
@Index(['name'], { unique: true })
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  capital: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string | null;

  @Column({ type: 'bigint', nullable: false })
  population: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency_code: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 6, nullable: true })
  exchange_rate: number | null;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  estimated_gdp: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  flag_url: string | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  last_refreshed_at: Date;
}
