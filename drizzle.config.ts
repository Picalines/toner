import { defineConfig } from 'drizzle-kit'
import { serverEnv } from '@/lib/env'

export default defineConfig({
	schema: './lib/db/schema.ts',
	out: './lib/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		host: serverEnv.DB_HOST,
		port: serverEnv.DB_PORT,
		user: serverEnv.DB_USER,
		password: serverEnv.DB_PASSWORD,
		database: serverEnv.DB_DATABASE,
	},
	verbose: true,
	strict: true,
})
