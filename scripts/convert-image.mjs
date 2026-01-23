import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

const outputPath = 'public/hero-journey/mountain-bg.webp';
await mkdir(dirname(outputPath), { recursive: true });

await sharp('Mapa_1.png')
  .webp({ quality: 90, lossless: false })
  .toFile(outputPath);

console.log('Imagen convertida a:', outputPath);
