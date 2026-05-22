import './instrument';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });

  await configureApp(app, { standalone: true });

  const port = process.env['PORT'] || 3001;
  await app.listen(port);
  const logger = app.get(Logger);
  logger.log(`SavSpot API running on http://localhost:${port}`);
  if (process.env['NODE_ENV'] !== 'production') {
    logger.log(`API docs available at http://localhost:${port}/docs`);
  }
}

bootstrap().catch((err) => {
  // Ensure fatal startup errors are logged to stdout before exit
  // (Fly.io / container hosts capture stdout/stderr in machine logs)
  console.error('Fatal startup error:', err);
  process.exit(1);
});
