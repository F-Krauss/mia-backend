// src/main.ts
import * as dotenv from 'dotenv';
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefix all routes with /api for consistent frontend/backend paths
  app.setGlobalPrefix('api');

  // Aumentar límite de tamaño de body
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.1.13:3000',
    'http://127.0.0.1:5173',
    'https://mia-test.t-efficiency.com',
  ];

  const extraAllowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  const allowedOrigins = [...defaultAllowedOrigins, ...extraAllowedOrigins];

  app.enableCors({
    origin:
      process.env.ALLOW_ALL_CORS === 'true'
        ? true
        : allowedOrigins,
    credentials: true,
  });

  // Choose a sensible default port based on environment so test/dev doesn't
  // conflict with production. Production: 4000, otherwise: 4001 (local/test).
  const defaultPort = process.env.NODE_ENV === 'production' ? 3001 : 3001;
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  // const port = Number.parseInt(process.env.PORT ?? String(defaultPort), 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
  }

  await app.listen(port, '0.0.0.0');
}
bootstrap();
