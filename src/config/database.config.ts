import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const databaseConfig = (): TypeOrmModuleOptions => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      `DATABASE_URL environment variable is not set. Current value: ${dbUrl}`,
    );
  }

  const url = new URL(dbUrl);
  console.log(url);

  return {
    type: 'mysql',
    host: url.hostname,
    port: parseInt(url.port, 10),
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    ssl: false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true, // Enable for development
    logging: false,
  };
};
