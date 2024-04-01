import { serverEnv } from '../env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from './schema'

const pgClient = new Client({
	host: serverEnv.DB_HOST,
	port: serverEnv.DB_PORT,
	user: serverEnv.DB_USER,
	password: serverEnv.DB_PASWORD,
	database: serverEnv.DB_DATABASE,
})

pgClient.connect()

export const database = drizzle(pgClient, { schema })

export { schema as databaseSchema }
export * from './schema'
