import 'reflect-metadata'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'

config()

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'alef',
  password: process.env.DB_PASSWORD ?? 'alef',
  database: process.env.DB_DATABASE ?? 'alef_dev',
  // __dirname-relative (not `src/...`) so this same compiled file works
  // both under ts-node in dev (__dirname = src/config) and as plain JS in
  // the production image, which only ever contains dist/ — a literal
  // `src/**` glob would silently match nothing there.
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
})
