import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const nodeEnv = config.get<string>('app.nodeEnv');
  const port = config.get<number>('app.port') ?? 4000;
  const apiPrefix = config.get<string>('app.apiPrefix') ?? '/api/v1';
  const frontendUrl = config.get<string>('app.frontendUrl') ?? 'http://localhost:3000';

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
  }));

  // CORS — allow only known origins
  app.enableCors({
    origin: nodeEnv === 'production' ? [frontendUrl] : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Cookie parsing (for refresh token)
  app.use(cookieParser());

  // Global validation — strip unknown fields
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(apiPrefix);

  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}${apiPrefix}`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap();
