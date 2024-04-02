import { lucia } from '.'
import { Cookie, Session, User } from 'lucia'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const authenticate = async (): Promise<
	{ user: User; session: Session } | { user: null; session: null }
> => {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
	if (!sessionId) {
		return {
			user: null,
			session: null,
		}
	}

	const validationResult = await lucia.validateSession(sessionId)

	// next.js throws when you attempt to set cookie when rendering page
	try {
		const { session } = validationResult
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

	return validationResult
}

export const authenticateOrRedirect = async (redirectPath = '/sign-in') => {
	const auth = await authenticate()

	if (!auth.user) {
		redirect(redirectPath)
	}

	return auth
}
