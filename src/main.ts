import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  GlobalExceptionFilter,
  PrismaExceptionFilter,
  ValidationExceptionFilter,
} from './filters';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');

  // Get config service
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS — allow frontend to communicate
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter(app.getHttpAdapter()));
  app.useGlobalFilters(new ValidationExceptionFilter(app.getHttpAdapter()));

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('🎵 Music Streaming API')
    .setDescription(
      'RESTful API for Music Streaming platform — inspired by Boomplay',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('songs', 'Song management')
    .addTag('singers', 'Singer/Artist management')
    .addTag('topics', 'Topic/Genre management')
    .addTag('playlists', 'Playlist management')
    .addTag('favorites', 'Favorite songs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Health check endpoint - use Express app directly
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/health', (req: any, res: any) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Readiness check endpoint
  expressApp.get('/ready', (req: any, res: any) => {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  });

  const port = configService.get<number>('PORT') || 3002;
  const server = await app.listen(port);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`${signal} received. Starting graceful shutdown...`);

    // Close server first
    server.close(() => {
      logger.log('HTTP server closed');
    });

    // Set timeout for forced shutdown
    const forceKill = setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);

    try {
      // Close database connections
      const prismaService: any = app.get('PrismaService');
      if (prismaService && typeof prismaService.$disconnect === 'function') {
        await prismaService.$disconnect();
        logger.log('Prisma connection closed');
      }

      clearTimeout(forceKill);
      logger.log('Graceful shutdown completed');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during shutdown: ${err.message}`);
      clearTimeout(forceKill);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, error.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
  });

  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/docs`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`Readiness check: http://localhost:${port}/ready`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error(`Failed to start server: ${error.message}`, error.stack);
  process.exit(1);
});
