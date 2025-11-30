// src/main.ts
import * as dotenv from 'dotenv';
import { join } from 'path';

// Decide el archivo de env según NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

// Carga el archivo desde la carpeta raíz del proyecto (un nivel arriba de dist/)
const envPath = join(__dirname, '..', envFile);
dotenv.config({ path: envPath });

// DEBUG: deja esto mientras probamos
console.log(
  'Bootstrapping MIA backend',
  'NODE_ENV=', process.env.NODE_ENV,
  'envPath=', envPath,
  'has FIREBASE?', !!process.env.FIREBASE_SERVICE_ACCOUNT,
);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const defaultPort = process.env.NODE_ENV === 'production' ? 3001 : 3001;
  const port = Number(process.env.PORT ?? defaultPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`MIA backend listening on port ${port}`);

}
bootstrap();
