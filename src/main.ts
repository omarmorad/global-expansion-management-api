import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

let cachedApp: NestExpressApplication;

async function bootstrapServer(): Promise<NestExpressApplication> {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // Enable CORS for frontend integration
    app.enableCors({
      origin:
        process.env.NODE_ENV === 'production'
          ? [
              'https://your-frontend-domain.com',
              'https://your-render-app.onrender.com',
            ]
          : ['http://localhost:3001', 'http://localhost:3000'],
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const app = await bootstrapServer();
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
}
