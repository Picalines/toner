import { lucia } from '.'
import { Cookie, Session, User } from 'lucia'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type UserAuth = { user: User; session: Session }

export const authenticate = async (): Promise<UserAuth | null> => {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
	if (!sessionId) {
		return null
	}

	const { user, session } = await lucia.validateSession(sessionId)

	// next.js throws when you attempt to set cookie when rendering page
	try {
		let sessionCookie: Cookie | undefined = undefined

		if (session?.fresh === true) {
			sessionCookie = lucia.createSessionCookie(session.id)
		} else if (!session) {
			sessionCookie = lucia.createBlankSessionCookie()
		}

		if (sessionCookie) {
			cookies().set(
				sessionCookie.name,
				sessionCookie.value,
				sessionCookie.attributes,
			)
		}
	} catch {}

	return user && session ? { user, session } : null
}

export const authenticateOrRedirect = async (
	redirectPath: string,
): Promise<UserAuth> => {
	const auth = await authenticate()

	if (!auth?.user) {
		redirect(redirectPath)
	}

	return auth
}
