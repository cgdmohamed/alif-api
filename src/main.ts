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

  // In production, CORS_ORIGIN must be set explicitly to a comma-separated
  // allowlist — reflecting any origin (the old `?? true` default) would let
  // any website make authenticated, credentialed requests against this API.
  const isProduction = process.env.NODE_ENV === 'production'
  const corsOrigin = process.env.CORS_ORIGIN?.split(',') ?? (isProduction ? false : true)
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
