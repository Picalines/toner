import { loadEnvConfig } from '@next/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { getDatabaseEnvironment } from './db-env'

async function main() {
	loadEnvConfig(process.cwd())

	const { default: config } = await import('@/drizzle.config')

	console.log('migration started')

	if (!config.out) {
		console.error('migrationsFolder is not specified')
		process.exit(1)
	}

	const dbEnv = getDatabaseEnvironment()

	const pool = new Pool({
		host: dbEnv.DB_HOST,
		port: dbEnv.DB_PORT,
		user: dbEnv.DB_USER,
		password: dbEnv.DB_PASSWORD,
		database: dbEnv.DB_DATABASE,
	})

	const db = drizzle(pool)

	await migrate(db, { migrationsFolder: config.out })

	console.log('migrated successfully')
}

main()
	.then(() => process.exit(0))
	.catch(reason => {
		console.error(reason)
		process.exit(1)
	})
