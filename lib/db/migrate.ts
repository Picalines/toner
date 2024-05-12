import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import config from '@/drizzle.config'
import { serverEnv } from '../env'

async function main() {
	console.log('migration started')

	if (!config.out) {
		console.error('migrationsFolder is not specified')
		process.exit(1)
	}

	const pool = new Pool({
		host: serverEnv.DB_HOST,
		port: serverEnv.DB_PORT,
		user: serverEnv.DB_USER,
		password: serverEnv.DB_PASSWORD,
		database: serverEnv.DB_DATABASE,
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
