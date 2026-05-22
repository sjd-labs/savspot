/**
 * Vercel serverless entry for the SavSpot NestJS API.
 *
 * Vercel rewrites every request to `/api/index` (see vercel.json) and
 * dispatches it through the cached Express server. The Nest app is
 * created once per cold start; subsequent requests reuse the warm
 * instance thanks to Fluid Compute.
 *
 * The dual-entry layout (this file + apps/api/src/main.ts) keeps the
 * standalone Node bootstrap available for local dev, the existing Fly
 * deploy (until it's torn down), and CI's e2e suite. Both paths share
 * the same setup via `configureApp()`.
 */
import '../src/instrument';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Express, type Request, type Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

const server: Express = express();
let bootstrapped: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    rawBody: true,
    bufferLogs: true,
  });
  await configureApp(app);
  await app.init();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (!bootstrapped) {
    bootstrapped = bootstrap().catch((err) => {
      // Reset so the next request retries the bootstrap rather than
      // serving 500s forever from a cached rejection.
      bootstrapped = null;
      throw err;
    });
  }
  await bootstrapped;
  server(req as unknown as Request, res as unknown as Response);
}
