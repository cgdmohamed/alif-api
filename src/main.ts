import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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

bootstrap()
