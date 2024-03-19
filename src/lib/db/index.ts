import { drizzle } from 'drizzle-orm/node-postgres'
import { serverEnv } from '../env'
import { Client } from 'pg'
import * as schema from './schema'

const pgClient = new Client({
	host: serverEnv.DB_HOST,
	port: serverEnv.DB_PORT,
	user: serverEnv.DB_USER,
	password: serverEnv.DB_PASWORD,
	database: serverEnv.DB_DATABASE,
})

export const dbClient = drizzle(pgClient, { schema })
