# Country Currency & Exchange API

A NestJS REST API that fetches country data and exchange rates from external APIs, caches them in MySQL, and provides CRUD operations with filtering and sorting capabilities.

## Features

- Fetch and cache country data from REST Countries API
- Fetch real-time exchange rates from Open Exchange Rates API
- Calculate estimated GDP based on population and exchange rates
- Automatic image generation with country statistics
- Case-insensitive country name searches
- Filtering by region and currency
- Sorting by estimated GDP
- Comprehensive error handling

## Prerequisites

- Node.js (v18+)
- MySQL database
- npm or yarn

## Environment Setup

Copy the environment file and configure your database connection:

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```
PORT=8080
DATABASE_URL=mysql://username:password@host:port/database?ssl-mode=REQUIRED
```

## Installation

```bash
npm install
```

## Database Setup

The application uses TypeORM with automatic synchronization in development. In production, consider using proper migrations.

```bash
# For development with auto-sync
npm run start:dev

# For production, disable synchronize and use migrations
# DATABASE_URL=mysql://user:pass@host:db/production_db?synchronize=false
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

| Method | Endpoint             | Description                             |
| ------ | -------------------- | --------------------------------------- |
| POST   | `/countries/refresh` | Refresh country data and exchange rates |
| GET    | `/countries`         | Get all countries with optional filters |
| GET    | `/countries/:name`   | Get country by name (case-insensitive)  |
| DELETE | `/countries/:name`   | Delete country by name                  |
| GET    | `/status`            | Get cache statistics                    |
| GET    | `/countries/image`   | Get generated summary image             |

## Query Parameters

### GET /countries

- `region` - Filter by region (e.g., `?region=Africa`)
- `currency` - Filter by currency code (e.g., `?currency=NGN`)
- `sort` - Sort by GDP descending (e.g., `?sort=gdp_desc`)

## Examples

```bash
# Get all African countries
GET /countries?region=Africa

# Get countries with NGN currency
GET /countries?currency=NGN

# Get countries sorted by GDP
GET /countries?sort=gdp_desc

# Get specific country
GET /countries/nigeria

# Refresh data
POST /countries/refresh

# Get cache status
GET /status
```

## Response Formats

### Country Object

```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### Status Response

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

## Error Handling

- `400 Bad Request` - Validation errors
- `404 Not Found` - Country not found
- `503 Service Unavailable` - External API failures

## Testing

Run the test suite:

```bash
npm run test:e2e
```

## Image Generation

After refreshing data, a summary image is generated at `cache/summary.png` containing:

- Total number of countries
- Top 5 countries by estimated GDP
- Last refresh timestamp

Access via: `GET /countries/image`

## External APIs Used

- Countries: `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies`
- Exchange Rates: `https://open.er-api.com/v6/latest/USD`

## License

UNLICENSED
