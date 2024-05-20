import { drizzle } from 'drizzle-orm/node-postgres'
import { Client as PostgresClient } from 'pg'
import { getDatabaseEnvironment, shouldConnectToDatabase } from './db-env'
import * as schema from './schema'

declare module global {
	let postgresSqlClient: PostgresClient | undefined
}

if (!global.postgresSqlClient && shouldConnectToDatabase()) {
	const dbEnv = getDatabaseEnvironment()

	global.postgresSqlClient = new PostgresClient({
		host: dbEnv.DB_HOST,
		port: dbEnv.DB_PORT,
		user: dbEnv.DB_USER,
		password: dbEnv.DB_PASSWORD,
		database: dbEnv.DB_DATABASE,
	})

	void global.postgresSqlClient.connect()
}

export const database = drizzle(global.postgresSqlClient!, { schema })
