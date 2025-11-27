// src/main.ts
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
    'http://localhost:3000', // Vite dev (configured port)
    'http://localhost:3001',
    'http://192.168.1.13:3000', // IP local dev machine
    'http://127.0.0.1:5173',
    'https://mia.t-efficiency.com', // o el subdominio que estés usando
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

  const port = parseInt(process.env.PORT ?? '4000', 10); // nos movemos a 4000
  await app.listen(port, '0.0.0.0');
}
bootstrap();
