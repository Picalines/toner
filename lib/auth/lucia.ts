import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import { Lucia } from 'lucia'
import { database, databaseSchema } from '../db'
import { getAuthEnvironment } from './auth-env'

const adapter = new DrizzlePostgreSQLAdapter(
	database,
	databaseSchema.sessionTable,
	databaseSchema.accountTable,
)

const { AUTH_SECURE_COOKIES } = getAuthEnvironment()

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: AUTH_SECURE_COOKIES,
		},
	},
	getUserAttributes: attributes => ({
		login: attributes.login,
		displayName: attributes.displayName,
	}),
})

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		UserId: number
		DatabaseUserAttributes: {
			login: string
			displayName: string
		}
	}
}
