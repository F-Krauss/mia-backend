// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar límite de tamaño de body
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'https://mia.t-efficiency.com',   // o el subdominio que estés usando
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = parseInt(process.env.PORT ?? '4000', 10); // nos movemos a 4000
  await app.listen(port, '0.0.0.0');
}
bootstrap();
