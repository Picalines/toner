import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import { Lucia, Scrypt } from 'lucia'
import { database, databaseSchema } from '../db'

const adapter = new DrizzlePostgreSQLAdapter(
	database,
	databaseSchema.sessionTable,
	databaseSchema.accountTable,
)

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === 'production',
		},
	},
	getUserAttributes: attributes => ({
		login: attributes.login,
	}),
})

export const scrypt = new Scrypt()

export * from './authenticate'

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		UserId: number
		DatabaseUserAttributes: {
			login: string
		}
	}
}
