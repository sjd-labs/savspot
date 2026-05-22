import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// `@nestjs/swagger` and `@scalar/nestjs-api-reference` are loaded
// dynamically inside the !isProduction && standalone block below.
// A top-level import would always be evaluated at startup, but
// @scalar's CJS build requires @scalar/client-side-rendering as ESM
// (ERR_REQUIRE_ESM under Node 24's CJS), so the function fails before
// reaching the gate. Decorators (@ApiProperty etc) on DTOs still need
// @nestjs/swagger at runtime — that load happens elsewhere via the
// decorator imports, not from this file.

interface ConfigureAppOptions {
  /**
   * When true, the app is being booted as a long-running Node process
   * (apps/api/src/main.ts). Enables OS signal handling, Swagger docs,
   * and the OpenAPI export to disk. When false (Vercel serverless),
   * skip those — the handler reboots per cold start and Swagger isn't
   * needed because dev docs run locally.
   */
  standalone?: boolean;
}

/**
 * Shared NestJS app configuration. Called from both
 * apps/api/src/main.ts (Fly / local Node bootstrap) and
 * apps/api/api/index.ts (Vercel serverless handler) so request
 * handling behaves identically regardless of host.
 */
export async function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): Promise<void> {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const standalone = options.standalone ?? false;

  const logger = app.get(Logger);
  app.useLogger(logger);

  if (standalone) {
    // SIGTERM / SIGINT only meaningful for a long-running process.
    app.enableShutdownHooks();
  }

  // Security headers via helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          // Relax CSP only in dev for Scalar API docs
          scriptSrc: isProduction
            ? [`'self'`]
            : [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
          styleSrc: isProduction
            ? [`'self'`]
            : [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'https:'],
          fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
      xFrameOptions: false, // Handled by SecurityHeadersMiddleware (supports /embed exception)
    }),
  );

  // Cookie parsing (for refresh tokens)
  app.use(cookieParser());

  // CORS — allow configured origin + www variant
  const webUrl = process.env['WEB_URL'] || 'http://localhost:3000';
  const corsOrigins: (string | RegExp)[] = [webUrl];
  if (webUrl.includes('://') && !webUrl.includes('localhost')) {
    const url = new URL(webUrl);
    if (url.hostname.startsWith('www.')) {
      corsOrigins.push(webUrl.replace('www.', ''));
    } else {
      corsOrigins.push(`${url.protocol}//www.${url.hostname}`);
    }
  }
  // In development, also allow access from LAN IPs (e.g. accessing from another machine)
  if (!isProduction) {
    const webPort = new URL(webUrl).port || '3000';
    corsOrigins.push(new RegExp(`^http://192\\.168\\.\\d+\\.\\d+:${webPort}$`));
    corsOrigins.push(new RegExp(`^http://10\\.\\d+\\.\\d+\\.\\d+:${webPort}$`));
    corsOrigins.push(new RegExp(`^http://172\\.(1[6-9]|2\\d|3[01])\\.\\d+\\.\\d+:${webPort}$`));
  }
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global prefix (exclude health endpoint)
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });

  // Swagger (disabled in production, and skipped on serverless where the
  // OpenAPI dump to disk is meaningless because the FS is ephemeral).
  if (!isProduction && standalone) {
    // Dynamic imports — see top-of-file comment for why these can't be
    // top-level. Awaiting them is safe because configureApp() is async.
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const { apiReference } = await import('@scalar/nestjs-api-reference');

    const swaggerConfig = new DocumentBuilder()
      .setTitle('SavSpot API')
      .setDescription('SavSpot multi-tenant booking platform API')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    app.use(
      '/docs',
      apiReference({
        content: document,
        theme: 'kepler',
      }),
    );

    // Export OpenAPI spec to docs/openapi.json for tooling (Postman, SDK gen, AI)
    const docsDir = join(__dirname, '..', '..', '..', 'docs');
    mkdirSync(docsDir, { recursive: true });
    writeFileSync(
      join(docsDir, 'openapi.json'),
      JSON.stringify(document, null, 2),
    );
    logger.log(`OpenAPI spec written to docs/openapi.json`);
  }

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
