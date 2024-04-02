'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { authenticate, lucia } from '@/lib/auth'

export const signOut = async () => {
	const { session } = (await authenticate()) ?? { session: null }

	if (session) {
		await lucia.invalidateSession(session.id)

		const sessionCookie = lucia.createBlankSessionCookie()
		cookies().set(
			sessionCookie.name,
			sessionCookie.value,
			sessionCookie.attributes,
		)
	}

	redirect('/sign-in')
}
