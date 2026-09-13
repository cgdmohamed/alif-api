import 'reflect-metadata'
import { join } from 'path'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import type { NextFunction, Request, Response } from 'express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.set('trust proxy', 1)
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('X-Frame-Options', 'DENY')
    response.setHeader('Referrer-Policy', 'no-referrer')
    response.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()')
    next()
  })

  // LocalStorageProvider (content-library uploads) saves to ./uploads and
  // returns "/uploads/<key>" URLs — nothing served that path over HTTP
  // until now, so every uploaded file was unreachable regardless of the
  // provider being real or a dev stub.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())

  // Known production frontends, always allowed regardless of CORS_ORIGIN —
  // a missing/misconfigured env var on the hosting platform has silently
  // locked out real logins before. CORS_ORIGIN can still add more origins
  // (e.g. a staging domain) on top of this baseline.
  const KNOWN_PRODUCTION_ORIGINS = ['https://portal.aliffuture.com']

  const isProduction = process.env.NODE_ENV === 'production'
  const configuredOrigins =
    process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  // Reflecting any origin in production (the old `?? true` fallback) would
  // let any website make authenticated, credentialed requests against this
  // API — only the known + explicitly configured origins are allowed there.
  const corsOrigin = isProduction
    ? [...new Set([...KNOWN_PRODUCTION_ORIGINS, ...configuredOrigins])]
    : configuredOrigins.length > 0
      ? configuredOrigins
      : true
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('Alef Future API')
    .setDescription('Backend API for the Alef Future admin panel and mobile app')
    .setVersion('0.1')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`Alef API listening on http://localhost:${port} (docs at /docs)`)
}

bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start Alef API', error)
  process.exit(1)
})
