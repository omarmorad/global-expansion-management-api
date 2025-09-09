import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Create data directory in production
  if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.dirname(
      process.env.DATABASE_PATH || './data/database.sqlite',
    );
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on port: ${port}`);
  console.log(`📚 API Documentation available at: /api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
}

bootstrap();
