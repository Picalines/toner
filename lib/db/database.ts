import { drizzle } from 'drizzle-orm/node-postgres'
import { Client as PostgresClient } from 'pg'
import { serverEnv } from '../env'
import * as schema from './schema'

declare module global {
	let postgresSqlClient: PostgresClient | undefined
}

if (!global.postgresSqlClient) {
	global.postgresSqlClient = new PostgresClient({
		host: serverEnv.DB_HOST,
		port: serverEnv.DB_PORT,
		user: serverEnv.DB_USER,
		password: serverEnv.DB_PASSWORD,
		database: serverEnv.DB_DATABASE,
	})

	void global.postgresSqlClient.connect()
}

export const database = drizzle(global.postgresSqlClient, { schema })
