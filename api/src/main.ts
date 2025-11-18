import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true }));
  const uploadsDir = process.env.UPLOAD_DIR || './uploads';
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(join(process.cwd(), uploadsDir)));

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
}
bootstrap();
