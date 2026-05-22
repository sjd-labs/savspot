/**
 * Vercel serverless entry — JavaScript wrapper around the
 * pre-compiled NestJS bundle in dist/. Using .js (not .ts)
 * here tells Vercel to ship the file as-is rather than running
 * its own TypeScript compile, which doesn't honor our
 * tsc-alias step and so leaves `require("@/generated/prisma")`
 * unresolved.
 *
 * The build script (apps/api/scripts/vercel-build.sh) populates
 * dist/ and apps/api/node_modules with a flat hoisted layout
 * before `vercel build` runs.
 */
'use strict';

// Register tsconfig path aliases (e.g. `@/generated/prisma`) at runtime
// so the compiled JS can resolve them via Node's require hook. tsc-alias
// has known bugs that mis-rewrite bare module names (e.g. `inngest` →
// `../inngest` because of baseUrl ambiguity with src/inngest/), so we
// use the runtime hook instead.
require('tsconfig-paths').register({
  baseUrl: require('path').join(__dirname, '..', 'dist'),
  paths: {
    '@/*': ['*'],
    '@savspot/shared': ['shared/index.js'],
    '@savspot/ee': ['ee/index.js'],
  },
});

require('../dist/instrument');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/configure-app');

const server = express();
let bootstrapped = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    rawBody: true,
    bufferLogs: true,
  });
  await configureApp(app);
  await app.init();
}

module.exports = async function handler(req, res) {
  if (!bootstrapped) {
    bootstrapped = bootstrap().catch((err) => {
      // Reset so the next request retries the bootstrap rather than
      // serving 500s forever from a cached rejection.
      bootstrapped = null;
      throw err;
    });
  }
  await bootstrapped;
  server(req, res);
};
