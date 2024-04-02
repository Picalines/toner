import type { Config } from 'drizzle-kit'
import { serverEnv } from '@/lib/env'

export default {
	schema: './lib/db/schema.ts',
	out: './lib/db/migrations',
	driver: 'pg',
	dbCredentials: {
		host: serverEnv.DB_HOST,
		port: serverEnv.DB_PORT,
		user: serverEnv.DB_USER,
		password: serverEnv.DB_PASWORD,
		database: serverEnv.DB_DATABASE,
	},
	verbose: true,
	strict: true,
} satisfies Config
