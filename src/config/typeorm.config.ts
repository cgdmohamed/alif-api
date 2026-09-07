import { registerAs } from '@nestjs/config'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'alef',
    password: process.env.DB_PASSWORD ?? 'alef',
    database: process.env.DB_DATABASE ?? 'alef_dev',
    autoLoadEntities: true,
    // Real migrations exist now (src/database/migrations) and run on boot
    // — see the Dockerfile/docker-compose.yaml CMD. `synchronize` defaults
    // OFF: it can drop/alter columns based on entity changes alone, which
    // is fine against a disposable local dev database but not safe to run
    // against one holding real data. Opt in explicitly (DB_SYNCHRONIZE=true)
    // for quick local prototyping when you don't want to generate a
    // migration for every entity tweak yet.
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  }),
)
