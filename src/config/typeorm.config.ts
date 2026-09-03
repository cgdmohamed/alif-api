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
    // No hand-written migrations exist yet in this project (see README's
    // "Production notes") — schema has only ever been created by
    // synchronize. Tying this to NODE_ENV alone would silently disable it
    // in production and boot against an empty, table-less database. Keep
    // it on by default everywhere until real migrations are generated,
    // with an explicit opt-out for whenever that lands.
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
  }),
)
