import { defineConfig } from 'drizzle-kit'
import { getDatabaseEnvironment } from './lib/db'

const dbEnv = getDatabaseEnvironment()

export default defineConfig({
	schema: './lib/db/schema.ts',
	out: './lib/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		host: dbEnv.DB_HOST,
		port: dbEnv.DB_PORT,
		user: dbEnv.DB_USER,
		password: dbEnv.DB_PASSWORD,
		database: dbEnv.DB_DATABASE,
	},
	verbose: true,
	strict: true,
})
