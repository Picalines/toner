import { serverEnv } from '../env'
import config from '@/drizzle.config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

async function main() {
	console.log('migration started')

	const pool = new Pool({
		host: serverEnv.DB_HOST,
		port: serverEnv.DB_PORT,
		user: serverEnv.DB_USER,
		password: serverEnv.DB_PASWORD,
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
