import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { Country } from '../countries/country.entity';

@Injectable()
export class ImageService {
  private readonly imagePath = path.join(process.cwd(), 'cache', 'summary.png');

  async generateSummaryImage(
    total: number,
    timestamp: string,
    countries: Country[],
  ): Promise<void> {
    const top5 = countries
      .filter((c) => c.estimated_gdp !== null)
      .sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0))
      .slice(0, 5);

    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0, 0, 800, 600);

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Country GDP Summary', 50, 60);

    // Total
    ctx.font = '24px Arial';
    ctx.fillStyle = '#555';
    ctx.fillText(`Total Countries: ${total}`, 50, 120);
    ctx.fillText(
      `Last Refreshed: ${new Date(timestamp).toLocaleString()}`,
      50,
      160,
    );

    // Top 5
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#0066cc';
    ctx.fillText('Top 5 by Estimated GDP', 50, 220);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#333';
    top5.forEach((c, i) => {
      const gdp = c.estimated_gdp?.toLocaleString() || 'N/A';
      ctx.fillText(`${i + 1}. ${c.name}: $${gdp}`, 70, 260 + i * 40);
    });

    // Ensure directory
    const dir = path.dirname(this.imagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(this.imagePath, buffer);
  }

  getImagePath(): string | null {
    return fs.existsSync(this.imagePath) ? this.imagePath : null;
  }
}
